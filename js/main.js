// ============================================================
//  main.js — Bootstrap audio + event wiring
//  Espone playSuccessSound / playErrorSound / playApplauseSound
//  / playSpinSound / generateConfetti come funzioni globali
// ============================================================

// ----------------------------------------------------------
// Funzione coriandoli (globale, usata da game.js)
// ----------------------------------------------------------
function generateConfetti() {
	var $c      = $('#confetti');
	var colors  = ['red', 'blue', 'green', 'yellow', 'pink'];

	for (var i = 0; i < 60; i++) {
		var $piece = $('<div class="confetti-piece ' + colors[Math.floor(Math.random() * colors.length)] + '"></div>');
		$piece.css({
			left:              (Math.random() * 100) + '%',
			top:               '-10px',
			animationDuration: (2 + Math.random()) + 's',
			animationDelay:    (Math.random() * 0.3) + 's'
		});
		$c.append($piece);
	}

	setTimeout(function () { $c.children().remove(); }, 4500);
}

// ----------------------------------------------------------
// Inizializzazione al caricamento del DOM
// ----------------------------------------------------------
$(document).ready(function () {

	// ---- Audio Setup ----
	var bgMusic       = document.getElementById('bg-music');
	var successSound  = document.getElementById('success-sound');
	var errorSound    = document.getElementById('error-sound');
	var applauseSound = document.getElementById('applause-sound');
	var spinSound     = document.getElementById('spin-sound');

	var $musicBtn       = $('#musicControlBtn');
	var $musicContainer = $('#musicControlContainer');
	var $volumeSlider   = $('#volumeSlider');

	var isMuted       = localStorage.getItem('ruota_fortuna_music_muted') === 'true';
	var savedVolume   = localStorage.getItem('ruota_fortuna_music_volume');
	var currentVolume = savedVolume !== null ? parseFloat(savedVolume) : 0.5;

	bgMusic.volume = currentVolume;
	if (successSound)  successSound.volume  = 0.9;
	if (errorSound)    errorSound.volume    = 0.9;
	if (applauseSound) applauseSound.volume = 1.0;
	if (spinSound)     spinSound.volume     = 0.8;
	$volumeSlider.val(currentVolume);

	if (isMuted) {
		$musicBtn.addClass('muted');
		$musicContainer.addClass('muted');
	}

	// ---- Funzioni audio globali ----
	window.playSuccessSound = function () {
		if (isMuted || !successSound) return;
		successSound.currentTime = 0;
		successSound.play().catch(function () {});
	};

	window.playErrorSound = function () {
		if (isMuted || !errorSound) return;
		errorSound.currentTime = 0;
		errorSound.play().catch(function () {});
	};

	window.playApplauseSound = function () {
		if (isMuted || !applauseSound) return;
		applauseSound.currentTime = 0;
		applauseSound.play().catch(function () {});
	};

	window.playSpinSound = function () {
		if (isMuted || !spinSound) return;
		// Riproduce solo se il file è caricabile (evita errori se wheel_spin.mp3 manca)
		spinSound.currentTime = 0;
		spinSound.play().catch(function () {
			// File non ancora presente — silenzioso
		});
	};

	function playMusic() {
		if (isMuted) return;
		bgMusic.volume = currentVolume;
		bgMusic.play().catch(function () {});
	}

	// Avvia musica al primo click/keypress
	function autoPlayOnInteraction() {
		if (!isMuted) playMusic();
		$(document).off('click keypress', autoPlayOnInteraction);
	}
	$(document).on('click keypress', autoPlayOnInteraction);

	// ---- Controllo volume ----
	$musicBtn.click(function (e) {
		e.stopPropagation();
		isMuted = !isMuted;
		localStorage.setItem('ruota_fortuna_music_muted', isMuted);
		if (isMuted) {
			bgMusic.pause();
			$musicBtn.addClass('muted');
			$musicContainer.addClass('muted');
		} else {
			if (currentVolume === 0) { currentVolume = 0.3; $volumeSlider.val(0.3); }
			bgMusic.volume = currentVolume;
			$musicBtn.removeClass('muted');
			$musicContainer.removeClass('muted');
			playMusic();
		}
	});

	$volumeSlider.on('input', function () {
		currentVolume = parseFloat(this.value);
		localStorage.setItem('ruota_fortuna_music_volume', currentVolume);
		if (currentVolume === 0) {
			isMuted = true;
			bgMusic.pause();
			$musicBtn.addClass('muted');
			$musicContainer.addClass('muted');
		} else {
			isMuted = false;
			bgMusic.volume = currentVolume;
			$musicBtn.removeClass('muted');
			$musicContainer.removeClass('muted');
			playMusic();
		}
		localStorage.setItem('ruota_fortuna_music_muted', isMuted);
	});

	// ============================================================
	//  SETUP SCREEN
	// ============================================================
	var MIN_PLAYERS = 2;

	// Genera i campi per 2 giocatori di default
	function addPlayerField(index, name) {
		var n = name || '';
		var $row = $(
			'<div class="player-setup-row" id="player-row-' + index + '">' +
				'<span class="player-setup-num">' + (index + 1) + '</span>' +
				'<input type="text" class="player-name-input" placeholder="Nome Giocatore ' + (index + 1) + '" value="' + n + '" maxlength="20">' +
				(index >= MIN_PLAYERS ? '<button class="btn-remove-player" data-index="' + index + '">✕</button>' : '') +
			'</div>'
		);
		$('#players-setup-list').append($row);
	}

	addPlayerField(0);
	addPlayerField(1);

	// Popola la select dei gruppi di frasi
	if (typeof PHRASE_GROUPS !== 'undefined') {
		var $groupSel = $('#phrase-group-select');
		Object.keys(PHRASE_GROUPS).forEach(function (g) {
			$groupSel.append($('<option>').val(g).text(g + ' (' + PHRASE_GROUPS[g].length + ')'));
		});
	}

	$('#add-player-btn').click(function () {
		var count = $('#players-setup-list .player-setup-row').length;
		addPlayerField(count);
	});

	$(document).on('click', '.btn-remove-player', function () {
		$(this).closest('.player-setup-row').remove();
		// Ri-numera
		$('#players-setup-list .player-setup-row').each(function (i) {
			$(this).attr('id', 'player-row-' + i);
			$(this).find('.player-setup-num').text(i + 1);
			$(this).find('.player-name-input').attr('placeholder', 'Nome Giocatore ' + (i + 1));
		});
	});

	$('#start-game-btn').click(function () {
		var names = [];
		$('.player-name-input').each(function () {
			var v = $(this).val().trim();
			if (v) names.push(v);
		});

		if (names.length < MIN_PLAYERS) {
			$('#setup-error').text('Inserisci almeno ' + MIN_PLAYERS + ' giocatori!').show();
			return;
		}

		$('#setup-error').hide();

		// Inizializza la ruota e avvia il gioco con il gruppo selezionato
		var sel = $('#phrase-group-select').val();
		var phrasesToUse = PHRASES;
		if (sel && sel !== '__all__' && typeof PHRASE_GROUPS !== 'undefined' && PHRASE_GROUPS[sel]) {
			phrasesToUse = PHRASE_GROUPS[sel];
		}

		Wheel.init('wheel-canvas');
		Game.startGame(names, phrasesToUse);
	});

	// ============================================================
	//  GAME SCREEN — Event Handlers
	// ============================================================

	// Gira la ruota
	$('#spin-btn').click(function () {
		Game.handleSpin();
	});

	// Tasto invio sulla ruota (accessibilità)
	$(document).on('keypress', function (e) {
		if ($(document.activeElement).is('input')) return;
		if (e.which === 13 && Game.getState() === 'PLAYER_TURN') {
			Game.handleSpin();
		}
	});

	// Mostra input soluzione
	$('#solve-btn').click(function () {
		Game.showSolveInput();
	});

	// Acquista vocale
	$('#buy-vowel-btn').click(function () {
		Game.showBuyVowelInput && Game.showBuyVowelInput();
	});

	// Conferma lettera
	$('#guess-letter-btn').click(function () {
		var letter = $('#letter-input').val();
		Game.handleLetterGuess(letter);
	});

	// Conferma acquisto vocale
	$('#buy-vowel-confirm-btn').click(function () {
		var letter = $('#vowel-input').val();
		Game.handleBuyVowel && Game.handleBuyVowel(letter);
	});

	$('#vowel-input').on('keypress', function (e) {
		if (e.which === 13) {
			var letter = $(this).val();
			Game.handleBuyVowel && Game.handleBuyVowel(letter);
		}
	});

	// Annulla acquisto vocale
	$('#buy-vowel-cancel-btn').click(function () {
		Game.cancelBuyVowel && Game.cancelBuyVowel();
	});

	$('#letter-input').on('keypress', function (e) {
		if (e.which === 13) {
			var letter = $(this).val();
			Game.handleLetterGuess(letter);
		}
	});

	// Blocca input a sole lettere
	$('#letter-input').on('input', function () {
		this.value = this.value.replace(/[^a-zA-ZÀ-ÿ]/g, '').toUpperCase();
	});

	// Conferma soluzione
	$('#confirm-solve-btn').click(function () {
		var guess = $('#solve-input').val();
		Game.handleSolveAttempt(guess);
	});

	$('#solve-input').on('keypress', function (e) {
		if (e.which === 13) {
			var guess = $(this).val();
			Game.handleSolveAttempt(guess);
		}
	});

	// Annulla soluzione
	$('#cancel-solve-btn').click(function () {
		Game.cancelSolve();
	});

	// ============================================================
	//  ROUND END & GAME END
	// ============================================================

	$('#next-round-btn').click(function () {
		$('#round-end-overlay').hide();
		Game.startRound();
	});

	$('#end-game-btn').click(function () {
		$('#round-end-overlay').hide();
		Game.endGame ? Game.endGame() : null;
		// endGame è già chiamato da _endRound quando _round >= TOTAL_ROUNDS
		// Questo pulsante è un trigger manuale di sicurezza
	});

	$('#play-again-btn').click(function () {
		location.reload();
	});

});