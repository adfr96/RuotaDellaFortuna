$(document).ready(function() {
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
		
		// Create the letter cells
		for (var i = 0, len = phrase_.length; i < len; i++) {
			if (phrase_[i] !== " ") {
				$('.tabbellone').append('<span class="letter-cell ' + phrase_[i] + ' uncheck">_</span>');
			} else {
				$('.tabbellone').append('<span class="space-cell"> </span>');
			}
		}
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
			
			// Controlla che sia una lettera e non sia stata già usata
			if (!/[A-Z\u00C0-\u00DF]/.test(char) || char_used.indexOf(char) !== -1) {
				e.preventDefault();
				return;
			}
			
			// Se ci sono lettere da scoprire
			if ($(".uncheck")[0]) {
				$('.' + char).text(char).addClass('check').removeClass('uncheck');
			}
			
			// Aggiungi lettera al contatore
			char_used += char;
			$('.char-used').text('Lettere giocate: ' + char_used);
			
			// Controlla se hai vinto
			if ($(".uncheck")[0] === undefined) {
				setTimeout(function() {
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
		
		if (guess === cleanPhrase) {
			// RISPOSTA CORRETTA!
			$('.guess-input').removeClass('error');
			$('.guess-feedback').addClass('success').text('✓ Esatto! Parola indovinata!');
			
			// Rivela tutte le lettere
			$('.letter-cell.uncheck').each(function() {
				var classes = $(this).attr('class').split(' ');
				var letter = classes[1]; // La lettera è sempre la seconda classe
				$(this).text(letter).addClass('check').removeClass('uncheck');
			});
			
			// Genera coriandoli
			generateConfetti();
			
			// Disabilita input
			$('.guess-input').prop('disabled', true);
			$('.guess-btn').prop('disabled', true);
		} else {
			// RISPOSTA SBAGLIATA!
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