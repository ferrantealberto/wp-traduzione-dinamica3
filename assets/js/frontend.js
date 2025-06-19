/**
 * JavaScript Frontend per Dynamic Page Translator
 * File: assets/js/frontend.js
 */

(function($) {
    'use strict';
    
    // Variabili globali
    let currentLanguage = dptFrontend.currentLang;
    let translationQueue = [];
    let isTranslating = false;
    
    /**
     * Inizializzazione del plugin
     */
    function init() {
        setupLanguageSwitcher();
        setupDynamicTranslation();
        setupCustomPositions();
        setupKeyboardNavigation();
        setupAccessibility();
        
        // Event listeners
        $(document).on('click', '.dpt-lang-option', handleLanguageChange);
        $(document).on('click', '.dpt-lang-link', handleLanguageChange);
        $(document).on('click', '.dpt-lang-card', handleLanguageChange);
        
        // Inizializza bandiere se presenti
        if (typeof dptFlags !== 'undefined') {
            initFlags();
        }
        
        // Processa traduzioni dinamiche se presenti
        if (typeof dptDynamicTranslations !== 'undefined') {
            processDynamicTranslations();
        }
    }
    
    /**
     * Setup language switcher
     */
    function setupLanguageSwitcher() {
        const $switcher = $('#dpt-language-switcher');
        if (!$switcher.length) return;
        
        // Setup dropdown
        setupDropdown($switcher);
        
        // Setup popup
        setupPopup($switcher);
        
        // Setup sidebar slide
        setupSidebarSlide($switcher);
        
        // Setup circle menu
        setupCircleMenu($switcher);
        
        // Setup minimal
        setupMinimal($switcher);
        
        // Mostra switcher se era nascosto
        $switcher.show();
    }
    
    /**
     * Setup dropdown functionality
     */
    function setupDropdown($container) {
        const $dropdown = $container.find('.dpt-dropdown-container');
        if (!$dropdown.length) return;
        
        const $trigger = $dropdown.find('.dpt-dropdown-trigger');
        const $menu = $dropdown.find('.dpt-dropdown-menu');
        
        $trigger.on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const isOpen = $menu.is(':visible');
            
            // Chiudi tutti gli altri dropdown
            $('.dpt-dropdown-menu').hide();
            $('.dpt-dropdown-trigger').attr('aria-expanded', 'false');
            
            if (!isOpen) {
                $menu.show();
                $trigger.attr('aria-expanded', 'true');
                
                // Focus primo elemento
                $menu.find('.dpt-lang-option').first().focus();
            }
        });
        
        // Chiudi dropdown cliccando fuori
        $(document).on('click', function(e) {
            if (!$dropdown.is(e.target) && $dropdown.has(e.target).length === 0) {
                $menu.hide();
                $trigger.attr('aria-expanded', 'false');
            }
        });
        
        // Navigazione con tastiera
        $menu.on('keydown', '.dpt-lang-option', function(e) {
            const $options = $menu.find('.dpt-lang-option');
            const currentIndex = $options.index(this);
            
            switch(e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    const nextIndex = (currentIndex + 1) % $options.length;
                    $options.eq(nextIndex).focus();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    const prevIndex = currentIndex === 0 ? $options.length - 1 : currentIndex - 1;
                    $options.eq(prevIndex).focus();
                    break;
                case 'Escape':
                    $menu.hide();
                    $trigger.attr('aria-expanded', 'false').focus();
                    break;
            }
        });
    }
    
    /**
     * Setup popup functionality
     */
    function setupPopup($container) {
        const $trigger = $container.find('.dpt-popup-trigger');
        const $overlay = $container.find('.dpt-popup-overlay');
        const $close = $container.find('.dpt-popup-close');
        
        if (!$trigger.length || !$overlay.length) return;
        
        $trigger.on('click', function(e) {
            e.preventDefault();
            $overlay.fadeIn(200);
            $('body').addClass('dpt-popup-open');
            
            // Focus primo elemento
            $overlay.find('.dpt-lang-card').first().focus();
        });
        
        $close.on('click', closePopup);
        $overlay.on('click', function(e) {
            if (e.target === this) {
                closePopup();
            }
        });
        
        function closePopup() {
            $overlay.fadeOut(200);
            $('body').removeClass('dpt-popup-open');
            $trigger.focus();
        }
        
        // ESC per chiudere
        $(document).on('keydown', function(e) {
            if (e.key === 'Escape' && $overlay.is(':visible')) {
                closePopup();
            }
        });
    }
    
    /**
     * Setup sidebar slide functionality
     */
    function setupSidebarSlide($container) {
        const $trigger = $container.find('.dpt-sidebar-trigger');
        const $overlay = $container.find('.dpt-sidebar-overlay');
        const $panel = $container.find('.dpt-sidebar-panel');
        const $close = $container.find('.dpt-sidebar-close');
        
        if (!$trigger.length || !$panel.length) return;
        
        $trigger.on('click', function(e) {
            e.preventDefault();
            openSidebar();
        });
        
        $close.on('click', closeSidebar);
        $overlay.on('click', closeSidebar);
        
        function openSidebar() {
            $overlay.fadeIn(200);
            $panel.css('transform', 'translateX(0)');
            $('body').addClass('dpt-sidebar-open');
            
            // Focus primo elemento
            $panel.find('.dpt-sidebar-option').first().focus();
        }
        
        function closeSidebar() {
            $overlay.fadeOut(200);
            $panel.css('transform', 'translateX(-100%)');
            $('body').removeClass('dpt-sidebar-open');
            $trigger.focus();
        }
        
        // ESC per chiudere
        $(document).on('keydown', function(e) {
            if (e.key === 'Escape' && $overlay.is(':visible')) {
                closeSidebar();
            }
        });
    }
    
    /**
     * Setup circle menu functionality
     */
    function setupCircleMenu($container) {
        const $trigger = $container.find('.dpt-circle-trigger');
        const $menu = $container.find('.dpt-circle-menu');
        
        if (!$trigger.length || !$menu.length) return;
        
        $trigger.on('click', function(e) {
            e.preventDefault();
            
            if ($menu.is(':visible')) {
                closeCircleMenu();
            } else {
                openCircleMenu();
            }
        });
        
        function openCircleMenu() {
            $menu.show();
            $trigger.addClass('active');
            
            // Anima le opzioni
            $menu.find('.dpt-circle-option').each(function(index) {
                const $option = $(this);
                setTimeout(() => {
                    $option.addClass('visible');
                }, index * 50);
            });
        }
        
        function closeCircleMenu() {
            $menu.find('.dpt-circle-option').removeClass('visible');
            $trigger.removeClass('active');
            
            setTimeout(() => {
                $menu.hide();
            }, 300);
        }
        
        // Chiudi cliccando fuori
        $(document).on('click', function(e) {
            if (!$container.is(e.target) && $container.has(e.target).length === 0) {
                closeCircleMenu();
            }
        });
    }
    
    /**
     * Setup minimal style functionality
     */
    function setupMinimal($container) {
        const $trigger = $container.find('.dpt-minimal-current');
        const $options = $container.find('.dpt-minimal-options');
        
        if (!$trigger.length || !$options.length) return;
        
        $trigger.on('click', function(e) {
            e.preventDefault();
            $options.toggle();
        });
        
        // Chiudi cliccando fuori
        $(document).on('click', function(e) {
            if (!$container.is(e.target) && $container.has(e.target).length === 0) {
                $options.hide();
            }
        });
    }
    
    /**
     * Gestisce il cambio di lingua
     */
    function handleLanguageChange(e) {
        e.preventDefault();
        
        const newLanguage = $(this).data('lang');
        if (!newLanguage || newLanguage === currentLanguage) {
            return;
        }
        
        // Mostra loading
        showLoadingState();
        
        // Invia richiesta AJAX
        $.ajax({
            url: dptFrontend.ajaxUrl,
            type: 'POST',
            data: {
                action: 'dpt_change_language',
                language: newLanguage,
                nonce: dptFrontend.nonce
            },
            success: function(response) {
                if (response.success) {
                    currentLanguage = newLanguage;
                    
                    // Aggiorna cookie
                    document.cookie = `dpt_current_lang=${newLanguage}; path=/; max-age=${30 * 24 * 60 * 60}`;
                    
                    // Aggiorna meta tag
                    $('meta[name="dpt-current-language"]').attr('content', newLanguage);
                    
                    // Aggiorna URL se necessario
                    updatePageUrl(newLanguage);
                    
                    // Traduce il contenuto della pagina
                    if (dptFrontend.autoTranslate) {
                        translatePageContent(newLanguage);
                    }
                    
                    // Aggiorna switcher
                    updateLanguageSwitcher(newLanguage);
                    
                    // Event personalizzato
                    $(document).trigger('dpt:languageChanged', {
                        newLanguage: newLanguage,
                        oldLanguage: currentLanguage
                    });
                    
                    // Ricarica pagina se richiesto
                    if (response.data.reload) {
                        location.reload();
                    }
                } else {
                    showError(response.data.message || dptFrontend.strings.translationError);
                }
            },
            error: function() {
                showError(dptFrontend.strings.translationError);
            },
            complete: function() {
                hideLoadingState();
            }
        });
    }
    
    /**
     * Setup traduzione dinamica
     */
    function setupDynamicTranslation() {
        // Observer per contenuti dinamici
        if (window.MutationObserver) {
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach(function(node) {
                            if (node.nodeType === 1) { // Element node
                                queueTranslation($(node));
                            }
                        });
                    }
                });
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }
    
    /**
     * Processa traduzioni dinamiche
     */
    function processDynamicTranslations() {
        if (currentLanguage === dptFrontend.defaultLang) {
            return;
        }
        
        dptDynamicTranslations.forEach(function(translation) {
            queueTranslation(null, translation);
        });
        
        processTranslationQueue();
    }
    
    /**
     * Aggiunge elemento alla coda di traduzione
     */
    function queueTranslation($element, translationData) {
        if (translationData) {
            translationQueue.push(translationData);
        } else if ($element) {
            // Trova testo da tradurre nell'elemento
            const textNodes = getTextNodes($element);
            textNodes.forEach(function(node) {
                const text = node.textContent.trim();
                if (text.length > 3) { // Solo testi significativi
                    translationQueue.push({
                        element: node,
                        content: text,
                        source_lang: dptFrontend.defaultLang,
                        target_lang: currentLanguage
                    });
                }
            });
        }
    }
    
    /**
     * Processa la coda di traduzione
     */
    function processTranslationQueue() {
        if (isTranslating || translationQueue.length === 0) {
            return;
        }
        
        isTranslating = true;
        
        // Prende batch di elementi da tradurre
        const batchSize = 5;
        const batch = translationQueue.splice(0, batchSize);
        
        batch.forEach(function(item) {
            translateElement(item);
        });
        
        // Continua con il prossimo batch
        setTimeout(function() {
            isTranslating = false;
            processTranslationQueue();
        }, 1000);
    }
    
    /**
     * Traduce un singolo elemento
     */
    function translateElement(item) {
        $.ajax({
            url: dptFrontend.ajaxUrl,
            type: 'POST',
            data: {
                action: 'dpt_translate_element',
                content: item.content,
                source_lang: item.source_lang,
                target_lang: item.target_lang,
                cache_key: item.cache_key || generateCacheKey(item.content, item.source_lang, item.target_lang),
                nonce: dptFrontend.nonce
            },
            success: function(response) {
                if (response.success) {
                    if (item.element) {
                        // Aggiorna nodo di testo
                        item.element.textContent = response.data.translation;
                    } else {
                        // Trova e aggiorna elementi con contenuto originale
                        updateContentInPage(item.content, response.data.translation);
                    }
                }
            }
        });
    }
    
    /**
     * Traduce tutto il contenuto della pagina
     */
    function translatePageContent(targetLang) {
        // Trova tutti gli elementi di testo
        const textElements = $('h1, h2, h3, h4, h5, h6, p, li, td, th, span, div').not('.dpt-language-switcher, .dpt-flag-switcher');
        
        textElements.each(function() {
            const $element = $(this);
            const text = $element.text().trim();
            
            if (text.length > 3 && !$element.find('*').length) { // Solo elementi con solo testo
                queueTranslation(null, {
                    element: this,
                    content: text,
                    source_lang: dptFrontend.defaultLang,
                    target_lang: targetLang
                });
            }
        });
        
        processTranslationQueue();
    }
    
    /**
     * Setup posizioni personalizzate
     */
    function setupCustomPositions() {
        if (dptFrontend.flagPosition !== 'custom' || !dptFrontend.customPositions) {
            return;
        }
        
        const $switcher = $('#dpt-language-switcher');
        if (!$switcher.length) return;
        
        dptFrontend.customPositions.forEach(function(position) {
            const $target = $(position.selector);
            if ($target.length) {
                const $clone = $switcher.clone().show();
                
                switch(position.method) {
                    case 'append':
                        $target.append($clone);
                        break;
                    case 'prepend':
                        $target.prepend($clone);
                        break;
                    case 'after':
                        $target.after($clone);
                        break;
                    case 'before':
                        $target.before($clone);
                        break;
                }
            }
        });
        
        // Nasconde switcher originale
        $switcher.hide();
    }
    
    /**
     * Setup navigazione da tastiera
     */
    function setupKeyboardNavigation() {
        // Combinazione tasti per aprire language switcher
        $(document).on('keydown', function(e) {
            // Alt + L per aprire language switcher
            if (e.altKey && e.key === 'l') {
                e.preventDefault();
                const $trigger = $('.dpt-dropdown-trigger, .dpt-popup-trigger, .dpt-sidebar-trigger').first();
                if ($trigger.length) {
                    $trigger.click();
                }
            }
        });
    }
    
    /**
     * Setup accessibilità
     */
    function setupAccessibility() {
        // Aggiunge ruoli ARIA
        $('.dpt-language-switcher').attr('role', 'navigation').attr('aria-label', dptFrontend.strings.selectLanguage);
        
        // Aggiunge descrizioni per screen reader
        $('.dpt-lang-option').each(function() {
            const $option = $(this);
            const lang = $option.data('lang');
            $option.attr('aria-label', `${dptFrontend.strings.changeLanguage}: ${lang}`);
        });
    }
    
    /**
     * Utility functions
     */
    function getTextNodes($element) {
        const textNodes = [];
        
        $element.contents().each(function() {
            if (this.nodeType === 3) { // Text node
                textNodes.push(this);
            } else if (this.nodeType === 1) { // Element node
                textNodes.push(...getTextNodes($(this)));
            }
        });
        
        return textNodes;
    }
    
    function generateCacheKey(content, sourceLang, targetLang) {
        const data = content + sourceLang + targetLang;
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }
    
    function updateContentInPage(originalContent, translatedContent) {
        $('*').contents().filter(function() {
            return this.nodeType === 3 && this.textContent.trim() === originalContent;
        }).each(function() {
            this.textContent = translatedContent;
        });
    }
    
    function updatePageUrl(newLanguage) {
        if (history.replaceState) {
            const url = new URL(window.location);
            url.searchParams.set('lang', newLanguage);
            history.replaceState(null, '', url.toString());
        }
    }
    
    function updateLanguageSwitcher(newLanguage) {
        // Aggiorna stato attivo
        $('.dpt-lang-option').removeClass('active').removeAttr('aria-current');
        $(`.dpt-lang-option[data-lang="${newLanguage}"]`).addClass('active').attr('aria-current', 'page');
        
        // Aggiorna trigger dropdown se presente
        const $trigger = $('.dpt-dropdown-trigger');
        if ($trigger.length) {
            const $newFlag = $(`.dpt-lang-option[data-lang="${newLanguage}"] .dpt-flag`).clone();
            const newLabel = $(`.dpt-lang-option[data-lang="${newLanguage}"] .dpt-lang-label`).text();
            
            $trigger.find('.dpt-flag').replaceWith($newFlag);
            $trigger.find('.dpt-lang-label').text(newLabel);
        }
    }
    
    function showLoadingState() {
        $('.dpt-language-switcher').addClass('loading');
        $('body').css('cursor', 'wait');
    }
    
    function hideLoadingState() {
        $('.dpt-language-switcher').removeClass('loading');
        $('body').css('cursor', '');
    }
    
    function showError(message) {
        // Crea notifica di errore
        const $error = $('<div class="dpt-error-notification">' + message + '</div>');
        $('body').append($error);
        
        setTimeout(function() {
            $error.fadeOut(function() {
                $error.remove();
            });
        }, 3000);
    }
    
    // Inizializza le flags se il modulo è presente
    function initFlags() {
        if (typeof dptFlags !== 'undefined') {
            // Le flags sono gestite dal modulo separato
            $(document).trigger('dpt:initFlags', dptFlags);
        }
    }
    
    // Inizializza quando il documento è pronto
    $(document).ready(init);
    
    // Espone API pubblica
    window.DynamicTranslator = {
        changeLanguage: function(language) {
            $(`.dpt-lang-option[data-lang="${language}"]`).trigger('click');
        },
        getCurrentLanguage: function() {
            return currentLanguage;
        },
        translateText: function(text, targetLang, callback) {
            $.ajax({
                url: dptFrontend.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'dpt_translate_element',
                    content: text,
                    source_lang: dptFrontend.defaultLang,
                    target_lang: targetLang || currentLanguage,
                    nonce: dptFrontend.nonce
                },
                success: function(response) {
                    if (response.success && callback) {
                        callback(response.data.translation);
                    }
                }
            });
        },
        on: function(event, callback) {
            $(document).on('dpt:' + event, callback);
        }
    };
    
})(jQuery);