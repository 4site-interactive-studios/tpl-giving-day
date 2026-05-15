(function() {
	var cfg = window.GIVING_DAY_CONFIG;
	var MAX_DONORS = 5;

	function commafy(n) {
		return String(n).replace(/(^|[^\w.])(\d{4,})/g, function(_, p1, p2) {
			return p1 + p2.replace(/\d(?=(?:\d\d\d)+(?!\d))/g, "$&,");
		});
	}

	function shuffle(arr) {
		var a = arr.slice();
		for (var i = a.length - 1; i > 0; i--) {
			var j = Math.floor(Math.random() * (i + 1));
			var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
		}
		return a;
	}

	function updateThermometer(count, goal, fillElm, numberElm, prefix) {
		if (!fillElm || !numberElm) return;
		var pct = Math.min(parseInt(count / goal * 100, 10), 100);
		if (isNaN(pct)) pct = 0;
		fillElm.style.width = pct + "%";

		var shown = 0;
		var step = Math.max(1, Math.ceil(count / 80));
		var iv = window.setInterval(function() {
			shown = Math.min(count, shown + step);
			numberElm.innerHTML = prefix + commafy(shown) + " of " + prefix + commafy(goal) + " goal";
			if (shown >= count) window.clearInterval(iv);
		}, 50);

		if (count === 0) {
			numberElm.innerHTML = prefix + "0 of " + prefix + commafy(goal) + " goal";
		}
	}

	updateThermometer(cfg.give.total,   cfg.give.goal,
		document.getElementById("therm-give-fill"),
		document.getElementById("therm-give-number"), "$");
	updateThermometer(cfg.act.total,    cfg.act.goal,
		document.getElementById("therm-act-fill"),
		document.getElementById("therm-act-number"), "");
	updateThermometer(cfg.pledge.total, cfg.pledge.goal,
		document.getElementById("therm-pledge-fill"),
		document.getElementById("therm-pledge-number"), "");

	var picked = shuffle(cfg.donors).slice(0, MAX_DONORS);
	var rows = document.querySelectorAll("#most-recent tr");
	picked.forEach(function(d, i) {
		if (!rows[i]) return;
		rows[i].querySelector("td:nth-child(1)").innerHTML = d.name + ", <em>" + d.state + "</em>";
		rows[i].querySelector("td:nth-child(2)").textContent = "$" + commafy(d.amount);
	});
})();

(function initFooterYear() {
	var el = document.getElementById("footer-year");
	if (el) el.textContent = new Date().getFullYear();
})();

(function initImpactCarousel() {
	var track = document.querySelector(".impact-carousel .carousel-track");
	if (!track) return;
	var prevBtn = document.querySelector(".impact-carousel .carousel-arrow.prev");
	var nextBtn = document.querySelector(".impact-carousel .carousel-arrow.next");

	var n = track.querySelectorAll(".carousel-slide").length;
	if (n <= 1) return;

	// Treadmill setup: pre-shift the last slide to the front so we have a slide
	// to the left of "home". Lets the user swipe-backward into it instead of
	// hitting scrollLeft=0 as a hard edge.
	track.insertBefore(track.lastElementChild, track.firstElementChild);

	function getStep() {
		var first = track.querySelector(".carousel-slide");
		if (!first) return 0;
		var gap = parseInt(getComputedStyle(track).gap, 10) || 0;
		return first.getBoundingClientRect().width + gap;
	}

	// Set scrollLeft without triggering the CSS smooth-scroll behavior.
	function setScrollInstant(target) {
		var saved = track.style.scrollBehavior;
		track.style.scrollBehavior = "auto";
		track.scrollLeft = target;
		track.style.scrollBehavior = saved || "";
	}

	// Move k slides from front of DOM to end; compensate scrollLeft so the
	// visible position doesn't change.
	function rotateForward(k) {
		var step = getStep();
		for (var i = 0; i < k; i++) {
			track.appendChild(track.firstElementChild);
		}
		setScrollInstant(track.scrollLeft - k * step);
	}

	// Move k slides from end of DOM to front; compensate scrollLeft.
	function rotateBackward(k) {
		var step = getStep();
		for (var i = 0; i < k; i++) {
			track.insertBefore(track.lastElementChild, track.firstElementChild);
		}
		setScrollInstant(track.scrollLeft + k * step);
	}

	// After every scroll settles, rotate the DOM so the user is back at "home"
	// (scrollLeft = one step). Net effect: scrollLeft stays bounded, the slide
	// array silently rotates, and the user perceives endless scrolling in both
	// directions with no edges and no resets.
	var settling = false;
	var settleTimer;
	function settle() {
		if (settling) return;
		var step = getStep();
		if (!step) return;
		var diff = Math.round(track.scrollLeft / step) - 1;
		if (diff !== 0) {
			settling = true;
			if (diff > 0) rotateForward(diff);
			else rotateBackward(-diff);
			requestAnimationFrame(function() { settling = false; });
		}
	}
	track.addEventListener("scroll", function() {
		if (settling) return;
		clearTimeout(settleTimer);
		settleTimer = setTimeout(settle, 150);
	});

	function scrollNext() {
		track.scrollBy({ left: getStep(), behavior: "smooth" });
	}
	function scrollPrev() {
		// Move the trailing slide to the front first so scrollLeft has room to
		// animate backward by one step; then trigger the smooth scroll.
		settling = true;
		rotateBackward(1);
		requestAnimationFrame(function() {
			settling = false;
			track.scrollBy({ left: -getStep(), behavior: "smooth" });
		});
	}

	// Initial home position: scrollLeft = one step, so the original first slide
	// (now at DOM index 1 after the pre-rotation) is the leftmost-visible slide.
	setScrollInstant(getStep());

	if (prevBtn) prevBtn.addEventListener("click", scrollPrev);
	if (nextBtn) nextBtn.addEventListener("click", scrollNext);

	track.setAttribute("tabindex", "0");
	track.setAttribute("role", "region");
	track.setAttribute("aria-label", "Impact stories carousel");
	track.addEventListener("keydown", function(e) {
		if (e.key === "ArrowRight") { e.preventDefault(); scrollNext(); }
		else if (e.key === "ArrowLeft") { e.preventDefault(); scrollPrev(); }
	});
})();
