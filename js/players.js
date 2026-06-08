// ============================================================
//  players.js — Gestione Giocatori e Montepremi
// ============================================================

var Players = (function () {

	var _players = [];
	var _currentIndex = 0;

	// ----------------------------------------------------------
	// Classe Player
	// ----------------------------------------------------------
	function Player(name) {
		this.name       = name;
		this.roundScore = 0;   // montepremi accumulato nella manche corrente
		this.totalScore = 0;   // montepremi totale (somma di tutte le manche)
	}

	Player.prototype.addRoundPrize = function (amount) {
		this.roundScore += amount;
		renderPlayers();
	};

	Player.prototype.deductRoundPrize = function (amount) {
	    this.roundScore = Math.max(0, this.roundScore - amount);
	    renderPlayers();
	};

	Player.prototype.bankrupt = function () {
		this.roundScore = 0;
		renderPlayers();
	};

	Player.prototype.collectRound = function () {
		this.totalScore += this.roundScore;
		this.roundScore = 0;
		renderPlayers();
	};

	// ----------------------------------------------------------
	// Inizializza i giocatori da un array di nomi
	// ----------------------------------------------------------
	function init(names) {
		_players = names.map(function (n) { return new Player(n.trim()); });
		_currentIndex = 0;
		renderPlayers();
	}

	// ----------------------------------------------------------
	// Giocatore corrente
	// ----------------------------------------------------------
	function current() {
		return _players[_currentIndex];
	}

	function currentIndex() {
		return _currentIndex;
	}

	// ----------------------------------------------------------
	// Avanza al giocatore successivo
	// ----------------------------------------------------------
	function nextPlayer() {
		_currentIndex = (_currentIndex + 1) % _players.length;
		renderPlayers();
		return current();
	}

	// ----------------------------------------------------------
	// Reset montepremi manche per tutti
	// ----------------------------------------------------------
	function resetRoundScores() {
		_players.forEach(function (p) { p.roundScore = 0; });
		renderPlayers();
	}

	// ----------------------------------------------------------
	// Classifica finale (ordinata per punteggio totale)
	// ----------------------------------------------------------
	function getLeaderboard() {
		return _players.slice().sort(function (a, b) { return b.totalScore - a.totalScore; });
	}

	function getAll() {
		return _players;
	}

	// ----------------------------------------------------------
	// Rendering UI
	// ----------------------------------------------------------
	function renderPlayers() {
		var $panel = $('#players-panel');
		$panel.empty();

		_players.forEach(function (player, i) {
			var isActive = (i === _currentIndex);
			var card = $(
				'<div class="player-card' + (isActive ? ' active' : '') + '" id="player-card-' + i + '">' +
					'<div class="player-name">' + _escapeHtml(player.name) + '</div>' +
					'<div class="player-round-score">Manche: <strong>' + _formatMoney(player.roundScore) + '</strong></div>' +
					'<div class="player-total-score">Totale: <strong>' + _formatMoney(player.totalScore) + '</strong></div>' +
					(isActive ? '<div class="player-turn-badge">▶ Il tuo turno</div>' : '') +
				'</div>'
			);
			$panel.append(card);
		});
	}

	// ----------------------------------------------------------
	// Helpers
	// ----------------------------------------------------------
	function _formatMoney(amount) {
		return amount.toLocaleString('it-IT') + ' €';
	}

	function _escapeHtml(str) {
		return str
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;');
	}

	// ----------------------------------------------------------
	// API pubblica
	// ----------------------------------------------------------
	return {
		init:             init,
		current:          current,
		currentIndex:     currentIndex,
		nextPlayer:       nextPlayer,
		resetRoundScores: resetRoundScores,
		getLeaderboard:   getLeaderboard,
		getAll:           getAll,
		render:           renderPlayers
	};

})();
