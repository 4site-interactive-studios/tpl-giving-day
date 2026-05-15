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

	var originals = Array.prototype.slice.call(track.querySelectorAll(".carousel-slide"));
	var n = originals.length;
	if (n <= 1) return;

	// Stack many copies of the slide set at both ends of the track. The user lands
	// in the middle and can scroll far in either direction without ever reaching
	// an edge — so there's no boundary to reset at, no jumps. Each "copy" is the
	// full set of n slides; total DOM slides = n * (2*COPIES_EACH_SIDE + 1).
	var COPIES_EACH_SIDE = 5;
	for (var c = 0; c < COPIES_EACH_SIDE; c++) {
		originals.forEach(function(slide) {
			var clone = slide.cloneNode(true);
			clone.classList.add("carousel-clone");
			clone.setAttribute("aria-hidden", "true");
			track.appendChild(clone);
		});
		for (var i = n - 1; i >= 0; i--) {
			var cloneLead = originals[i].cloneNode(true);
			cloneLead.classList.add("carousel-clone");
			cloneLead.setAttribute("aria-hidden", "true");
			track.insertBefore(cloneLead, track.firstChild);
		}
	}

	function getStep() {
		var first = track.querySelector(".carousel-slide");
		if (!first) return 0;
		var gap = parseInt(getComputedStyle(track).gap, 10) || 0;
		return first.getBoundingClientRect().width + gap;
	}

	// Start at the first original slide (DOM index = COPIES_EACH_SIDE * n).
	// All COPIES_EACH_SIDE*n slides on each side give scroll headroom.
	var saved = track.style.scrollBehavior;
	track.style.scrollBehavior = "auto";
	track.scrollLeft = COPIES_EACH_SIDE * n * getStep();
	track.style.scrollBehavior = saved || "";

	function scrollNext() {
		track.scrollBy({ left: getStep(), behavior: "smooth" });
	}
	function scrollPrev() {
		track.scrollBy({ left: -getStep(), behavior: "smooth" });
	}

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
