$(document).ready(function() {
	// --- GESTIONE MUSICA DI SOTTOFONDO E VOLUME ---
	var bgMusic = document.getElementById('bg-music');
	var successSound = document.getElementById('success-sound');
	var errorSound = document.getElementById('error-sound');
	var applauseSound = document.getElementById('applause-sound');
	var $musicBtn = $('#musicControlBtn');
	var $musicContainer = $('#musicControlContainer');
	var $volumeSlider = $('#volumeSlider');
	
	// Recupera lo stato muto precedente o default a falso (attivo)
	var isMuted = localStorage.getItem('ruota_fortuna_music_muted') === 'true';
	
	// Recupera il volume precedente o default a 0.5 (50%)
	var savedVolume = localStorage.getItem('ruota_fortuna_music_volume');
	var currentVolume = savedVolume !== null ? parseFloat(savedVolume) : 0.5;
	
	// Applica il volume iniziale all'elemento audio e allo slider. Gli effetti hanno un volume indipendente e alto (0.9) per risaltare.
	bgMusic.volume = currentVolume;
	if (successSound) successSound.volume = 0.9;
	if (errorSound) errorSound.volume = 0.9;
	if (applauseSound) applauseSound.volume = 1.0;
	$volumeSlider.val(currentVolume);
	
	// Applica lo stato iniziale visivo al pulsante e al contenitore
	if (isMuted) {
		$musicBtn.addClass('muted');
		$musicContainer.addClass('muted');
	} else {
		$musicBtn.removeClass('muted');
		$musicContainer.removeClass('muted');
	}
	
	// Funzione per avviare la riproduzione della musica di sottofondo
	function playMusic() {
		if (isMuted) return;
		bgMusic.volume = currentVolume;
		bgMusic.play().then(function() {
			$musicBtn.removeClass('muted');
			$musicContainer.removeClass('muted');
		}).catch(function(error) {
			console.log("Autoplay in attesa di interazione utente.");
		});
	}
	
	// Funzione per mettere in pausa la riproduzione della musica di sottofondo
	function pauseMusic() {
		bgMusic.pause();
	}

	// Funzioni per riprodurre gli effetti sonori rispettando lo stato muto (volume indipendente e alto a 0.9 per risaltare)
	function playApplauseSound() {
		if (isMuted || !applauseSound) return;
		applauseSound.volume = 1.0; // loud to highlight
		applauseSound.currentTime = 0;
		applauseSound.play().catch(function(error) {
			console.log('Errore riproduzione suono applauso:', error);
		});
	}

	function playSuccessSound() {
		if (isMuted || !successSound) return;
		successSound.volume = 0.9;
		successSound.currentTime = 0; // Ripristina all'inizio se il suono è già in riproduzione
		successSound.play().catch(function(error) {
			console.log("Errore riproduzione suono successo:", error);
		});
	}

	function playErrorSound() {
		if (isMuted || !errorSound) return;
		errorSound.volume = 0.9;
		errorSound.currentTime = 0; // Ripristina all'inizio se il suono è già in riproduzione
		errorSound.play().catch(function(error) {
			console.log("Errore riproduzione suono errore:", error);
		});
	}
	
	// Toggle della musica al click del pulsante fluttuante
	$musicBtn.click(function(e) {
		e.stopPropagation(); // Evita di attivare altri gestori di click sul documento
		isMuted = !isMuted;
		localStorage.setItem('ruota_fortuna_music_muted', isMuted);
		
		if (isMuted) {
			pauseMusic();
			$musicBtn.addClass('muted');
			$musicContainer.addClass('muted');
		} else {
			// UX: se il volume era a 0 e si riattiva la musica, alziamo il volume a 0.3
			if (currentVolume === 0) {
				currentVolume = 0.3;
				$volumeSlider.val(0.3);
				localStorage.setItem('ruota_fortuna_music_volume', 0.3);
			}
			bgMusic.volume = currentVolume;
			$musicBtn.removeClass('muted');
			$musicContainer.removeClass('muted');
			playMusic();
		}
	});
	
	// Gestione dello slider del volume (evento input continuo per fluidità)
	$volumeSlider.on('input', function() {
		currentVolume = parseFloat(this.value);
		localStorage.setItem('ruota_fortuna_music_volume', currentVolume);
		
		if (currentVolume === 0) {
			// Se il volume viene azzerato, mutiamo il gioco
			isMuted = true;
			localStorage.setItem('ruota_fortuna_music_muted', true);
			pauseMusic();
			$musicBtn.addClass('muted');
			$musicContainer.addClass('muted');
		} else {
			// Se il volume viene alzato, riattiviamo il gioco
			isMuted = false;
			localStorage.setItem('ruota_fortuna_music_muted', false);
			bgMusic.volume = currentVolume;
			$musicBtn.removeClass('muted');
			$musicContainer.removeClass('muted');
			playMusic();
		}
	});
	
	// Avvia l'audio al primo input o click dell'utente sulla pagina
	function autoPlayOnInteraction() {
		if (!isMuted) {
			playMusic();
		}
		// Rimuove i listener per evitare esecuzioni ripetute
		$(document).off('click keypress', autoPlayOnInteraction);
	}
	$(document).on('click keypress', autoPlayOnInteraction);
	// ----------------------------------------------

	// Funzione per rimuovere accenti ed equiparare lettere (es. È -> E)
	function normalizeAccents(str) {
		if (!str) return '';
		return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
	}

	//This var is for block the event for keypress while the player insert the phrase
	var config = 0;
	//Counter for game played
	var game = 0;
	//Var for save the char played
	var char_used = '';
	//Var to save the current phrase
	var currentPhrase = '';
	//Var for saved phrases
	var savedPhrases = [];
	
	// Carica le frasi salvate dalla costante PHRASES
	function loadSavedPhrases() {
		savedPhrases = PHRASES;
		populatePhraseSelect();
		populateThemesList();
	}
	
	// Popola il dropdown con le frasi salvate
	function populatePhraseSelect() {
		var select = $('.phrase-select');
		// Rimuovi tutte le opzioni tranne la prima
		select.find('option:not(:first)').remove();
		
		savedPhrases.forEach(function(item, index) {
			select.append('<option value="' + index + '">[' + item.tema + '] ' + item.frase + '</option>');
		});
	}
	
	// Popola la lista dei temi nella pagina
	function populateThemesList() {
		var themesList = $('#themesList');
		themesList.html('');
		
		savedPhrases.forEach(function(item, index) {
			var themeBtn = $('<button class="theme-btn" data-index="' + index + '">' + item.tema + '</button>');
			themeBtn.click(function() {
				selectTheme(index, $(this));
			});
			themesList.append(themeBtn);
		});
	}
	
	// Seleziona un tema e carica la frase
	function selectTheme(index, btnElement) {
		// Rimuovi selezione precedente
		$('.theme-btn').removeClass('selected');
		
		// Seleziona il nuovo bottone
		btnElement.addClass('selected');
		
		var selected = savedPhrases[index];
		$('.parse-me').val(selected.frase);
		$('.phrase-theme').val(selected.tema);
		
		// Avvia il gioco subito
		setTimeout(function() {
			startGame(selected.frase, selected.tema);
		}, 300);
	}
	
	// Funzione per avviare il gioco
	function startGame(phrase, theme) {
		phrase = phrase.toUpperCase().trim();
		
		// Validazione frase vuota
		if (!phrase) {
			alert('Inserisci una frase valida!');
			return;
		}
		
		// Aggiorna il display del tema
		$('.theme-value').text(theme || '-');
		
		currentPhrase = phrase;
		
		$('.tabbellone').html('');
		$('.char-used').text('Lettere giocate: ');
		char_used = '';
		game += 1;
		var gameText = game === 1 ? 'Partita' : 'Partite';
		$('.game').text(game + ' ' + gameText);
		
		// Rimuovi caratteri speciali mantenendo spazi
		var phrase_ = phrase.replace(/[^A-Z\u00C0-\u00DF ]/g, "");
		
		// Create the letter cells grouped by word containers to prevent broken word layouts on line wrapping
		var words = phrase_.split(' ');
		words.forEach(function(word) {
			if (word.length > 0) {
				var $wordCont = $('<span class="word-container"></span>');
				for (var i = 0, len = word.length; i < len; i++) {
					var origChar = word[i];
					var baseChar = normalizeAccents(origChar);
					var $cell = $('<span class="letter-cell ' + baseChar + ' uncheck">_</span>');
					$cell.data('char', origChar);
					$wordCont.append($cell);
				}
				$('.tabbellone').append($wordCont);
			}
		});
		config = 0;
		
		// Reset input
		$('.guess-input').val('').removeClass('error');
		$('.guess-feedback').removeClass('error success').text('');
		$('.guess-input').prop('disabled', false);
		$('.guess-btn').prop('disabled', false);
	}
	
	// Carica le frasi all'inizio
	loadSavedPhrases();
	
	//On click on the play button
	$('.new-phrase').click(function() {
		//Reset the textbox for the new phrase
		$('.parse-me').val('');
		$('.phrase-theme').val('');
		$('.char-used').val('');
		$('.guess-input').val('').removeClass('error');
		$('.guess-feedback').removeClass('error success').text('');
		$('.guess-input').prop('disabled', false);
		$('.guess-btn').prop('disabled', false);
		$('#phrase').modal('show');
		config = 1;
	});
	//Set the focus on the textbox
	$('#phrase').on('shown', function () {
		$('.parse-me').focus();
	})
	$('.go').click(function() {
		var phrase = $('.parse-me').val().toUpperCase().trim();
		var theme = $('.phrase-theme').val().trim() || '-';
		
		// Validazione frase vuota
		if (!phrase) {
			alert('Inserisci una frase valida!');
			return;
		}
		
		$('#phrase').modal('hide');
		startGame(phrase, theme);
	});
	$(this).bind('keypress', function(e) {
		// Se il focus è sul box di indovinazione, non processare
		if ($(document.activeElement).hasClass('guess-input')) {
			return;
		}
		
		if (config == 0) {
			var char = String.fromCharCode(e.charCode).toUpperCase();
			
			// Controlla che sia una lettera
			if (!/[A-Z\u00C0-\u00DF]/.test(char)) {
				e.preventDefault();
				return;
			}
			
			var baseChar = normalizeAccents(char);
			
			// Se la lettera è già stata usata, riproduci il suono di errore
			if (char_used.indexOf(baseChar) !== -1) {
				playErrorSound();
				e.preventDefault();
				return;
			}
			
			// Riproduci l'effetto sonoro a seconda che la lettera sia presente o meno nel tabellone
			var matchingCells = $('.' + baseChar);
			if (matchingCells.length > 0) {
				playSuccessSound();
			} else {
				playErrorSound();
			}
			
			// Se ci sono lettere da scoprire
			if ($(".uncheck")[0]) {
				matchingCells.each(function() {
					var origText = $(this).data('char');
					$(this).text(origText).addClass('check').removeClass('uncheck');
				});
			}
			
			// Aggiungi lettera al contatore
			char_used += baseChar;
			$('.char-used').text('Lettere giocate: ' + char_used);
			
			// Controlla se hai vinto
			if ($(".uncheck")[0] === undefined) {
				setTimeout(function() {
					playApplauseSound();
					$('.guess-input').prop('disabled', true);
					$('.guess-btn').prop('disabled', true);
					$('.guess-feedback').addClass('success').text('✓ Parola completata! Hai vinto!');
				}, 500);
			}
			
			e.preventDefault();
		}
	});
	
	// Funzione per generare coriandoli
	function generateConfetti() {
		var confettiContainer = $('#confetti');
		var colors = ['red', 'blue', 'green', 'yellow', 'pink'];
		
		for (var i = 0; i < 50; i++) {
			var $confetti = $('<div class="confetti-piece ' + colors[Math.floor(Math.random() * colors.length)] + '"></div>');
			var randomLeft = Math.random() * 100;
			var randomDelay = Math.random() * 0.2;
			var randomDuration = 2 + Math.random() * 1;
			
			$confetti.css({
				left: randomLeft + '%',
				top: '-10px',
				animationDuration: randomDuration + 's',
				animationDelay: randomDelay + 's'
			});
			
			confettiContainer.append($confetti);
		}
		
		// Rimuovi i coriandoli dopo l'animazione
		setTimeout(function() {
			confettiContainer.children().remove();
		}, 4000);
	}
	
	// Gestione del tentativo di indovinare
	$('.guess-btn').click(function() {
		if (config !== 0 || !currentPhrase) return;
		
		var guess = $('.guess-input').val().toUpperCase().trim().replace(/[^A-Z\u00C0-\u00DF ]/g, "");
		var cleanPhrase = currentPhrase.replace(/[^A-Z\u00C0-\u00DF ]/g, "");
		
		if (!guess) {
			return;
		}
		
		// Normalizziamo gli accenti per garantire un confronto corretto (es. EREDITÀ === EREDITA)
		var normGuess = normalizeAccents(guess);
		var normCleanPhrase = normalizeAccents(cleanPhrase);
		
		if (normGuess === normCleanPhrase) {
			// RISPOSTA CORRETTA!
			$('.guess-input').removeClass('error');
			$('.guess-feedback').addClass('success').text('✓ Esatto! Parola indovinata!');
			
			// Rivela tutte le lettere con il loro carattere originale (incluso l'accento)
			$('.letter-cell.uncheck').each(function() {
				var letter = $(this).data('char');
				$(this).text(letter).addClass('check').removeClass('uncheck');
			});
			
			// Genera coriandoli
			playApplauseSound();
			generateConfetti();
			
			// Disabilita input
			$('.guess-input').prop('disabled', true);
			$('.guess-btn').prop('disabled', true);
		} else {
			// RISPOSTA SBAGLIATA!
			playErrorSound();
			$('.guess-input').addClass('error');
			$('.guess-feedback').addClass('error').text('✗ Sbagliato! Continua a giocare...');
			
			// Rimuovi la classe error dopo 2 secondi
			setTimeout(function() {
				$('.guess-input').removeClass('error');
				$('.guess-feedback').removeClass('error').text('');
			}, 2000);
		}
		
		// Pulisci l'input
		$('.guess-input').val('');
	});
});