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
