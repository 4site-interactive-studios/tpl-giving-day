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

		if (numberElm._thermRaf) window.cancelAnimationFrame(numberElm._thermRaf);
		var from = numberElm._thermShown || 0;
		var duration = 4000;
		var start = null;

		if (count <= 0) {
			numberElm._thermShown = 0;
			numberElm.innerHTML = prefix + "0 of " + prefix + commafy(goal) + " goal";
			return;
		}

		function tick(ts) {
			if (start === null) start = ts;
			var t = Math.min((ts - start) / duration, 1);
			var shown = Math.round(from + (count - from) * t);
			numberElm._thermShown = shown;
			numberElm.innerHTML = prefix + commafy(shown) + " of " + prefix + commafy(goal) + " goal";
			numberElm._thermRaf = t < 1 ? window.requestAnimationFrame(tick) : null;
		}
		numberElm._thermRaf = window.requestAnimationFrame(tick);
	}

	var giveFill = document.getElementById("therm-give-fill");
	var giveNumber = document.getElementById("therm-give-number");
	var giveGoal = cfg.give.goal;
	var giveTotal = cfg.give.total;

	function renderGiveTherm() {
		updateThermometer(giveTotal, giveGoal, giveFill, giveNumber, "$");
	}

	renderGiveTherm();

	// Pull the live raised/goal values from the Fundraise Up goal meter
	// element (same data the embedded meter displays). Its config is a
	// JSONP-style file on FRU's CDN; no CORS, so load it via script tag
	// and capture the payload through FUN.elements.addElementContent.
	(function syncFromFruMeter() {
		var key = cfg.give.fruMeterKey;
		if (!key) return;
		window.FUN = window.FUN || {};
		window.FUN.elements = window.FUN.elements || {};
		var prevAdd = window.FUN.elements.addElementContent;
		window.FUN.elements.addElementContent = function(payload) {
			try {
				if (payload && payload.key === key && payload.data && payload.data.live) {
					var live = payload.data.live;
					var conf = payload.config || {};
					var raised = typeof live.value === "number" ? live.value : null;
					if (raised !== null && conf.isMatchAmountEnabled && conf.matchingFactor > 1) {
						raised *= conf.matchingFactor;
					}
					if (raised !== null) giveTotal = Math.round(raised);
					if (typeof conf.goalAmount === "number" && conf.goalAmount > 0) giveGoal = conf.goalAmount;
					renderGiveTherm();
				}
			} catch (e) {}
			if (typeof prevAdd === "function") return prevAdd.apply(this, arguments);
		};
		var s = document.createElement("script");
		s.src = "https://cdn.fundraiseup.com/elements-data/" + key + ".js";
		s.async = true;
		document.head.appendChild(s);
	})();

	if (typeof window.FundraiseUp === "function") {
		window.FundraiseUp.on("donationComplete", function(details) {
			if (!details || !details.donation || typeof details.donation.amount !== "number") return;
			giveTotal += Math.round(details.donation.amount);
			renderGiveTherm();
		});
	}

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

(function initImpactAccordion() {
	var panels = document.querySelectorAll(".impact-accordion .accordion-panel");
	if (!panels.length) return;

	panels.forEach(function(panel) {
		var head = panel.querySelector(".accordion-head");
		if (!head) return;
		head.addEventListener("click", function() {
			panels.forEach(function(p) {
				var open = p === panel;
				p.classList.toggle("is-open", open);
				var h = p.querySelector(".accordion-head");
				if (h) h.setAttribute("aria-expanded", open ? "true" : "false");
			});
		});
	});
})();
