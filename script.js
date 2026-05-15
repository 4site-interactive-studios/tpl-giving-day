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
	var prev = document.querySelector(".impact-carousel .carousel-arrow.prev");
	var next = document.querySelector(".impact-carousel .carousel-arrow.next");

	var originals = Array.prototype.slice.call(track.querySelectorAll(".carousel-slide"));
	var n = originals.length;
	if (n <= 1) return;

	// Clone the full slide set at both ends. DOM ends up as:
	//   [c1..cN, r1..rN, c1..cN]
	// Real slides occupy indices [n .. 2n-1]. Initial scroll lands on real slide 0.
	originals.forEach(function(slide) {
		var c = slide.cloneNode(true);
		c.classList.add("carousel-clone");
		c.setAttribute("aria-hidden", "true");
		track.appendChild(c);
	});
	for (var i = n - 1; i >= 0; i--) {
		var c = originals[i].cloneNode(true);
		c.classList.add("carousel-clone");
		c.setAttribute("aria-hidden", "true");
		track.insertBefore(c, track.firstChild);
	}

	function scrollToIndex(idx, smooth) {
		var slides = track.querySelectorAll(".carousel-slide");
		if (!slides[idx]) return;
		var trackRect = track.getBoundingClientRect();
		var slideRect = slides[idx].getBoundingClientRect();
		var pad = parseInt(getComputedStyle(track).paddingLeft, 10) || 0;
		var target = track.scrollLeft + (slideRect.left - trackRect.left) - pad;
		if (smooth) {
			track.scrollTo({ left: target, behavior: "smooth" });
		} else {
			track.scrollLeft = target;
		}
	}

	function leftmostSnappedIndex() {
		var slides = track.querySelectorAll(".carousel-slide");
		var trackRect = track.getBoundingClientRect();
		var pad = parseInt(getComputedStyle(track).paddingLeft, 10) || 0;
		var bestIdx = -1;
		var bestDiff = Infinity;
		for (var i = 0; i < slides.length; i++) {
			var diff = Math.abs(slides[i].getBoundingClientRect().left - trackRect.left - pad);
			if (diff < bestDiff) { bestDiff = diff; bestIdx = i; }
		}
		return bestIdx;
	}

	// Position on the first real slide once layout settles.
	requestAnimationFrame(function() { scrollToIndex(n, false); });

	// After a scroll settles, if we're sitting on a clone, silently jump to its real twin.
	var resetting = false;
	var settleTimer;
	track.addEventListener("scroll", function() {
		if (resetting) return;
		clearTimeout(settleTimer);
		settleTimer = setTimeout(function() {
			var idx = leftmostSnappedIndex();
			if (idx < 0) return;
			if (idx < n) {
				resetting = true;
				scrollToIndex(idx + n, false);
				requestAnimationFrame(function() { resetting = false; });
			} else if (idx >= 2 * n) {
				resetting = true;
				scrollToIndex(idx - n, false);
				requestAnimationFrame(function() { resetting = false; });
			}
		}, 150);
	});

	function scrollByOne(dir) {
		var slide = track.querySelector(".carousel-slide");
		if (!slide) return;
		var gap = parseInt(getComputedStyle(track).gap, 10) || 0;
		var step = slide.getBoundingClientRect().width + gap;
		track.scrollBy({ left: dir * step, behavior: "smooth" });
	}

	if (prev) prev.addEventListener("click", function() { scrollByOne(-1); });
	if (next) next.addEventListener("click", function() { scrollByOne(1); });

	track.setAttribute("tabindex", "0");
	track.setAttribute("role", "region");
	track.setAttribute("aria-label", "Impact stories carousel");
	track.addEventListener("keydown", function(e) {
		if (e.key === "ArrowRight") { e.preventDefault(); scrollByOne(1); }
		else if (e.key === "ArrowLeft") { e.preventDefault(); scrollByOne(-1); }
	});
})();
