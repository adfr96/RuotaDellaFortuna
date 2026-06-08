// ============================================================
//  game.js — State Machine principale del gioco
// ============================================================

var Game = (function () {
	'use strict';

	// ----------------------------------------------------------
	// Configurazione
	// ----------------------------------------------------------
	var TOTAL_ROUNDS = 3;
	// Costo (fisso) per acquistare una vocale
	var VOWEL_COST = 500;

	// ----------------------------------------------------------
	// Stato interno
	// ----------------------------------------------------------
	var _state          = 'SETUP';
	var _round          = 0;
	var _phraseOrder    = [];   // indici di PHRASES in ordine casuale
	var _phrasesList    = [];   // lista di frasi usata per la partita (può essere un gruppo)
	var _currentPhrase  = '';
	var _currentTheme   = '';
	var _currentBonus   = 0;
	var _usedLetters    = [];   // lettere base già giocate (normalizzate)
	var _lastSpinValue  = 0;    // valore dello spicchio corrente

	// ----------------------------------------------------------
	// Utility condivise
	// ----------------------------------------------------------
	function _normalizeAccents(str) {
		if (!str) return '';
		return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
	}

	function _formatMoney(amount) {
		return amount.toLocaleString('it-IT') + ' €';
	}

	function _escapeHtml(str) {
		return String(str)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;');
	}

	function _shuffleArray(arr) {
		var a = arr.slice();
		for (var i = a.length - 1; i > 0; i--) {
			var j = Math.floor(Math.random() * (i + 1));
			var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
		}
		return a;
	}

	// ----------------------------------------------------------
	// SETUP → inizio partita
	// ----------------------------------------------------------
	function startGame(playerNames, phraseList) {
		Players.init(playerNames);
		_phrasesList = phraseList && phraseList.length ? phraseList : PHRASES;
		_phraseOrder = _shuffleArray(_phrasesList.map(function (_, i) { return i; }));
		_round = 0;

		$('#setup-screen').hide();
		$('#endgame-screen').hide();
		$('#game-screen').show();

		startRound();
	}

	// ----------------------------------------------------------
	// Inizio manche
	// ----------------------------------------------------------
	function startRound() {
		_round++;

		if (_round > TOTAL_ROUNDS) {
			_endGame();
			return;
		}

		// Reset punteggi di manche
		Players.resetRoundScores();

		// Scegli frase (ciclica se i round superano le frasi disponibili)
		var phraseData = _phrasesList[_phraseOrder[(_round - 1) % _phraseOrder.length]];
		_currentPhrase = _normalizeAccents(phraseData.frase.toUpperCase().trim());
		_currentTheme  = phraseData.tema  || '-';
		_currentBonus  = phraseData.bonus || 0;
		_usedLetters   = [];

		// Aggiorna UI testuale
		$('#round-info').text('Manche ' + _round + ' di ' + TOTAL_ROUNDS);
		$('#phrase-theme').text('TEMA: ' + _currentTheme);
		// Mostra box tema sotto il tabellone
		$('#theme-box .theme-box-value').text(_currentTheme);
		$('#theme-box').show();
		if (_currentBonus > 0) {
			$('#phrase-bonus').text('Bonus frase: ' + _formatMoney(_currentBonus)).show();
		} else {
			$('#phrase-bonus').hide();
		}
		$('#char-used-display').text('Lettere giocate: ');

		// Renderizza il tabellone
		_renderBoard(_currentPhrase);

		// Chiudi overlay manche precedente
		$('#round-end-overlay').hide();
		$('#wheel-result-banner').hide().removeClass('prize pass bankrupt').text('');

		// Vai al turno del primo giocatore
		_setPlayerTurn();
	}

	// ----------------------------------------------------------
	// Imposta il turno del giocatore corrente
	// ----------------------------------------------------------
	function _setPlayerTurn() {
		_state = 'PLAYER_TURN';
		var player = Players.current();
		$('#current-player-name').text(player.name);
		_showTurnBanner('Turno di <strong>' + _escapeHtml(player.name) + '</strong>! Gira la ruota o tenta la soluzione.', 'info');
		_showActions(['spin', 'solve', 'buyVowel']);
		_hideLetterInput();
		_hideSolveInput();
	}

	function _nextPlayerTurn() {
		Players.nextPlayer();
		_setPlayerTurn();
	}

	// ----------------------------------------------------------
	// Spin della ruota
	// ----------------------------------------------------------
	function handleSpin() {
		if (_state !== 'PLAYER_TURN') return;
		_state = 'SPINNING';
		_showActions([]);
		$('#wheel-result-banner').hide().text('');

		// Mostra la ruota solo quando si clicca Gira la Ruota (overlay popup)
		// Sposto il wrapper direttamente sotto <body> così position:fixed funziona correttamente
		$('#wheel-wrapper').appendTo(document.body).addClass('wheel-overlay visible').show();
		try { Wheel.draw(); } catch (e) { /* ignore */ }

		Wheel.spin(function (slice) {
			_handleSpinResult(slice);
			// Mostra il risultato nel popup e attendi che l'utente chiuda il popup
			try {
				$('#wheel-popup-result').removeClass('prize pass bankrupt').addClass(slice.type).text(slice.label).show();
			} catch (e) {}
		});
	}

	function _handleSpinResult(slice) {
		_showWheelResult(slice);

		if (slice.type === 'prize') {
			_lastSpinValue = slice.value;
			_state = 'AWAITING_LETTER';
			_showTurnBanner('🎰 Hai ottenuto <strong>' + _formatMoney(slice.value) + '</strong>! Inserisci una lettera.', 'prize');
			_showActions([]);
			_showLetterInput();

		} else if (slice.type === 'pass') {
			if (typeof playErrorSound === 'function') playErrorSound();
			_showTurnBanner('➡️ PASSA! Il turno passa al prossimo giocatore.', 'pass');
			_state = 'PLAYER_TURN';
			setTimeout(_nextPlayerTurn, 2200);

		} else if (slice.type === 'bankrupt') {
			if (typeof playErrorSound === 'function') playErrorSound();
			Players.current().bankrupt();
			_showTurnBanner('💸 BANCAROTTA! Hai perso tutto il montepremi accumulato!', 'bankrupt');
			_state = 'PLAYER_TURN';
			setTimeout(_nextPlayerTurn, 2800);
		}
	}

// Chiusura del popup ruota su input utente
$(document).on('click', '#wheel-close-btn', function () {
	// Nascondi popup con transizione e riporta il wrapper nella sua posizione originale
	$('#wheel-wrapper').removeClass('visible');
	setTimeout(function () {
		$('#wheel-popup-result').hide().removeClass('prize pass bankrupt').text('');
		$('#wheel-wrapper').hide().removeClass('wheel-overlay');
		// Riporta il wrapper dentro #wheel-section per mantenere il DOM ordinato
		$('#wheel-wrapper').appendTo('#wheel-section');
	}, 300);
});

	// ----------------------------------------------------------
	// Indovina una lettera
	// ----------------------------------------------------------
	function handleLetterGuess(rawLetter) {
		if (_state !== 'AWAITING_LETTER') return;

		var letter = _normalizeAccents(rawLetter.toUpperCase().trim());
		if (!/^[A-Z]$/.test(letter)) return;

		// Le vocali non possono essere giocate come lettere normali
		if (['A','E','I','O','U'].indexOf(letter) !== -1) {
			if (typeof playErrorSound === 'function') playErrorSound();
			_showTurnBanner('⚠️ Le vocali non possono essere giocate come lettere normali. Usa il pulsante Compra Vocale.', 'error');
			$('#letter-input').val('').focus();
			return;
		}

		// Lettera già usata?
		if (_usedLetters.indexOf(letter) !== -1) {
			if (typeof playErrorSound === 'function') playErrorSound();
			_showTurnBanner('⚠️ La lettera "' + letter + '" è già stata giocata!', 'error');
			$('#letter-input').val('').focus();
			return;
		}

		// Registra lettera
		_usedLetters.push(letter);
		$('#char-used-display').text('Lettere giocate: ' + _usedLetters.join('  '));
		_hideLetterInput();

		// Conta occorrenze nella frase
		var count = 0;
		var phraseChars = _currentPhrase.replace(/[^A-Z]/g, '');
		for (var i = 0; i < phraseChars.length; i++) {
			if (phraseChars[i] === letter) count++;
		}

		if (count > 0) {
			var prize = _lastSpinValue * count;
			Players.current().addRoundPrize(prize);
			if (typeof playSuccessSound === 'function') playSuccessSound();
			_revealLetter(letter);

			var msg = '✓ <strong>' + count + '</strong> "' + letter + '" trovata' + (count > 1 ? '/e' : '') + '! <strong>+' + _formatMoney(prize) + '</strong>';
			_showTurnBanner(msg, 'success');

			if (_checkRoundWon()) {
				// Tutte le lettere rivelate → vince la manche (senza bonus da soluzione)
				setTimeout(_endRound, 1200);
			} else {
				_state = 'PLAYER_TURN';
				setTimeout(function () { _showActions(['spin', 'solve', 'buyVowel']); }, 1400);
			}
		} else {
			// Lettera assente
			if (typeof playErrorSound === 'function') playErrorSound();
			_showTurnBanner('✗ La lettera "' + letter + '" non è presente. Turno perso!', 'miss');
			_state = 'PLAYER_TURN';
			setTimeout(_nextPlayerTurn, 2200);
		}
	}

	// ----------------------------------------------------------
	// Tentativo di soluzione
	// ----------------------------------------------------------
	function showSolveInput() {
		if (_state !== 'PLAYER_TURN') return;
		_showActions([]);
		_showSolveInputUI();
	}

	function showBuyVowelInput() {
		if (_state !== 'PLAYER_TURN') return;
		var player = Players.current();
		if (!player || player.roundScore < VOWEL_COST) {
			if (typeof playErrorSound === 'function') playErrorSound();
			_showTurnBanner('⚠️ Moneta insufficiente per acquistare una vocale. Servono ' + _formatMoney(VOWEL_COST) + '.', 'error');
			return;
		}

		_state = 'BUYING_VOWEL';
		_showActions([]);
		_showTurnBanner('🅥 Acquisto vocale — Inserisci la vocale che vuoi comprare.', 'info');
		_hideLetterInput();
		_hideSolveInput();
		_showVowelInput();
	}

	function cancelBuyVowel() {
		_hideVowelInput();
		_state = 'PLAYER_TURN';
		_showActions(['spin', 'solve', 'buyVowel']);
	}

	function handleBuyVowel(rawLetter) {
		if (_state !== 'BUYING_VOWEL') return;

		var letter = _normalizeAccents(rawLetter.toUpperCase().trim());
		if (!/^[A-Z]$/.test(letter)) return;

		// Si accettano solo vocali
		if (['A','E','I','O','U'].indexOf(letter) === -1) {
			if (typeof playErrorSound === 'function') playErrorSound();
			_showTurnBanner('⚠️ Puoi acquistare solo vocali (A, E, I, O, U).', 'error');
			$('#vowel-input').val('').focus();
			return;
		}

		// Lettera già usata?
		if (_usedLetters.indexOf(letter) !== -1) {
			if (typeof playErrorSound === 'function') playErrorSound();
			_showTurnBanner('⚠️ La lettera "' + letter + '" è già stata giocata!', 'error');
			$('#vowel-input').val('').focus();
			return;
		}

		// Detrarre il costo
		Players.current().deductRoundPrize(VOWEL_COST);
		_usedLetters.push(letter);
		$('#char-used-display').text('Lettere giocate: ' + _usedLetters.join('  '));
		_hideVowelInput();

		// Conta occorrenze nella frase
		var count = 0;
		var phraseChars = _currentPhrase.replace(/[^A-Z]/g, '');
		for (var i = 0; i < phraseChars.length; i++) {
			if (phraseChars[i] === letter) count++;
		}

		if (count > 0) {
			_revealLetter(letter);
			if (typeof playSuccessSound === 'function') playSuccessSound();
			var msg = '✓ <strong>' + count + '</strong> "' + letter + '" trovata' + (count > 1 ? '/e' : '') + '! (Vocale acquistata <strong>-' + _formatMoney(VOWEL_COST) + '</strong>)';
			_showTurnBanner(msg, 'success');

			if (_checkRoundWon()) {
				setTimeout(_endRound, 1200);
			} else {
				_state = 'PLAYER_TURN';
				setTimeout(function () { _showActions(['spin', 'solve', 'buyVowel']); }, 1400);
			}
		} else {
			if (typeof playErrorSound === 'function') playErrorSound();
			_showTurnBanner('✗ La vocale "' + letter + '" non è presente. Turno perso!', 'miss');
			_state = 'PLAYER_TURN';
			setTimeout(_nextPlayerTurn, 2200);
		}
	}


	function handleSolveAttempt(rawGuess) {
		if (_state !== 'PLAYER_TURN') return;

		var guess       = _normalizeAccents(rawGuess.toUpperCase().trim()).replace(/[^A-Z ]/g, '');
		var cleanPhrase = _currentPhrase.replace(/[^A-Z ]/g, '');

		_hideSolveInput();

		if (guess === cleanPhrase) {
			// Risposta corretta!
			_revealAll();
			Players.current().addRoundPrize(_currentBonus);
			if (typeof playApplauseSound === 'function') playApplauseSound();
			var bonusMsg = _currentBonus > 0 ? ' <strong>+' + _formatMoney(_currentBonus) + ' bonus frase!</strong>' : '';
			_showTurnBanner('🎉 CORRETTO! <strong>' + _escapeHtml(Players.current().name) + '</strong> ha risolto la manche!' + bonusMsg, 'win');
			setTimeout(_endRound, 2200);
		} else {
			// Risposta sbagliata
			if (typeof playErrorSound === 'function') playErrorSound();
			_showTurnBanner('✗ Soluzione sbagliata! Il turno passa al prossimo.', 'miss');
			setTimeout(_nextPlayerTurn, 2200);
		}
	}

	function cancelSolve() {
		_hideSolveInput();
		_state = 'PLAYER_TURN';
		_showActions(['spin', 'solve', 'buyVowel']);
	}

	// ----------------------------------------------------------
	// Fine manche
	// ----------------------------------------------------------
	function _endRound() {
		_state = 'ROUND_END';

		var winner = Players.current();

		// Tutti i giocatori accumulano il montepremi di manche nel totale
		Players.getAll().forEach(function (p) {
			p.collectRound();
		});
		Players.render();

		// Mostra overlay
		$('#round-winner-name').text(winner.name);
		if (_round < TOTAL_ROUNDS) {
			$('#next-round-btn').show();
			$('#end-game-btn').hide();
		} else {
			$('#next-round-btn').hide();
			$('#end-game-btn').show();
		}
		$('#round-end-overlay').show();

		if (typeof generateConfetti === 'function') generateConfetti();
	}

	// ----------------------------------------------------------
	// Fine partita
	// ----------------------------------------------------------
	function _endGame() {
		_state = 'GAME_END';
		$('#game-screen').hide();
		$('#endgame-screen').show();

		var leaderboard = Players.getLeaderboard();
		var $lb = $('#final-leaderboard');
		$lb.empty();

		leaderboard.forEach(function (player, i) {
			var medals  = ['🥇', '🥈', '🥉'];
			var medal   = medals[i] !== undefined ? medals[i] : (i + 1) + '.';
			var isWinner = (i === 0);
			var card = $(
				'<div class="leaderboard-card' + (isWinner ? ' winner' : '') + '">' +
					'<span class="lb-medal">' + medal + '</span>' +
					'<span class="lb-name">' + _escapeHtml(player.name) + '</span>' +
					'<span class="lb-score">' + _formatMoney(player.totalScore) + '</span>' +
				'</div>'
			);
			$lb.append(card);
		});

		if (leaderboard.length > 0) {
			$('#winner-name').text(leaderboard[0].name);
		}

		if (typeof playApplauseSound === 'function') playApplauseSound();
		if (typeof generateConfetti === 'function') generateConfetti();
	}

	// ----------------------------------------------------------
	// Rendering del tabellone
	// ----------------------------------------------------------
	function _renderBoard(normalizedPhrase) {
		var $board = $('.tabbellone');
		$board.empty();

		// La frase è già normalizzata; manteniamo la versione originale per display
		var originalPhrase = normalizedPhrase; // già in maiuscolo, accenti rimossi dalla frase
		var chars = originalPhrase.split('');

		var words = [];
		var currentWord = [];
		chars.forEach(function (ch) {
			if (ch === ' ') {
				if (currentWord.length > 0) { words.push(currentWord); currentWord = []; }
			} else if (/[A-Z]/.test(ch)) {
				currentWord.push(ch);
			}
		});
		if (currentWord.length > 0) words.push(currentWord);

		words.forEach(function (word) {
			var $wordCont = $('<span class="word-container"></span>');
			word.forEach(function (ch) {
				var $cell = $('<span class="letter-cell ' + ch + ' uncheck">_</span>');
				$cell.data('char', ch);
				$wordCont.append($cell);
			});
			$board.append($wordCont);
		});
	}

	function _revealLetter(baseChar) {
		$('.letter-cell.' + baseChar + '.uncheck').each(function () {
			var orig = $(this).data('char') || baseChar;
			$(this).text(orig).addClass('check').removeClass('uncheck');
		});
	}

	function _revealAll() {
		$('.letter-cell.uncheck').each(function () {
			var orig = $(this).data('char');
			// Recupera lettera base dalla class list
			var classes = $(this).attr('class').split(' ');
			var base = '';
			classes.forEach(function (c) {
				if (c.length === 1 && /[A-Z]/.test(c)) base = c;
			});
			$(this).text(orig || base).addClass('check').removeClass('uncheck');
		});
	}

	function _checkRoundWon() {
		return $('.letter-cell.uncheck').length === 0;
	}

	// ----------------------------------------------------------
	// UI Helpers
	// ----------------------------------------------------------
	function _showActions(actions) {
		var showSpin  = actions.indexOf('spin')  !== -1;
		var showSolve = actions.indexOf('solve') !== -1;
		var showBuyVowel = actions.indexOf('buyVowel') !== -1;
		$('#spin-btn').prop('disabled', !showSpin).toggleClass('btn-hidden', !showSpin);
		$('#solve-btn').prop('disabled', !showSolve).toggleClass('btn-hidden', !showSolve);
		$('#buy-vowel-btn').prop('disabled', !showBuyVowel).toggleClass('btn-hidden', !showBuyVowel);
	}

	function _showLetterInput() {
		$('#letter-input-area').show();
		$('#letter-input').val('').focus();
	}

	function _hideLetterInput() {
		$('#letter-input-area').hide();
		$('#letter-input').val('');
	}

	function _showSolveInputUI() {
		$('#solve-input-area').show();
		$('#solve-input').val('').focus();
	}

	function _hideSolveInput() {
		$('#solve-input-area').hide();
		$('#solve-input').val('');
	}

	function _showVowelInput() {
		$('#vowel-input-area').show();
		$('#vowel-input').val('').focus();
	}

	function _hideVowelInput() {
		$('#vowel-input-area').hide();
		$('#vowel-input').val('');
	}

	function _showTurnBanner(html, type) {
		$('#turn-banner')
			.removeClass('info prize pass bankrupt success miss win error')
			.addClass(type)
			.html(html)
			.show();
	}

	function _showWheelResult(slice) {
		$('#wheel-result-banner')
			.removeClass('prize pass bankrupt')
			.addClass(slice.type)
			.text(slice.label)
			.show();
	}

	// ----------------------------------------------------------
	// API pubblica
	// ----------------------------------------------------------
	return {
		startGame:          startGame,
		startRound:         startRound,
		handleSpin:         handleSpin,
		handleLetterGuess:  handleLetterGuess,
		showSolveInput:     showSolveInput,
		showBuyVowelInput:  showBuyVowelInput,
		handleSolveAttempt: handleSolveAttempt,
		handleBuyVowel:     handleBuyVowel,
		cancelBuyVowel:     cancelBuyVowel,
		cancelSolve:        cancelSolve,
		endGame:            _endGame,
		getState:           function () { return _state; }
	};

})();

