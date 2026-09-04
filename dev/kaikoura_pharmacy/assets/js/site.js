/* ==========================================================================
   Kaikoura Pharmacy — nav toggle + accessible form handling.
   No dependencies. Safe to load with `defer`.

   ---------------------------------------------------------------------------
   SWAPPING IN A REAL FORM BACKEND
   ---------------------------------------------------------------------------
   Both forms currently validate in the browser and then hand the message to the
   visitor's mail client (data-mode="mailto"). That works on any static host with
   no server. To switch to a hosted form service instead:

     1. Formspree — set action="https://formspree.io/f/XXXX" method="post"
        on the <form>, and change data-mode="mailto" to data-mode="post".
     2. Netlify Forms — add netlify and name="contact" to the <form>,
        and change data-mode="mailto" to data-mode="post".

   In "post" mode this script only validates and then lets the browser submit
   normally. No markup changes needed beyond the form tag itself.
   ========================================================================== */

(function () {
  'use strict';

  /* --- Mobile navigation -------------------------------------------------- */

  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('primary-nav');

  if (toggle && nav) {
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
    };

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });

    // Reset state when the menu stops being a drawer, so it can't get stuck hidden.
    var wide = window.matchMedia('(min-width: 901px)');
    var onChange = function () { if (wide.matches) setOpen(false); };
    wide.addEventListener ? wide.addEventListener('change', onChange) : wide.addListener(onChange);
  }

  /* --- Forms -------------------------------------------------------------- */

  var ERROR_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>' +
    '<line x1="12" y1="16" x2="12.01" y2="16"/></svg>';

  var messageFor = function (input) {
    var label = input.getAttribute('data-label') || 'This field';
    if (input.validity.valueMissing) {
      return input.type === 'radio'
        ? 'Please choose an option for ' + label.toLowerCase() + '.'
        : 'Please enter ' + label.toLowerCase() + '.';
    }
    if (input.validity.typeMismatch && input.type === 'email') {
      return 'Please enter a valid email address, for example name@example.com.';
    }
    if (input.validity.typeMismatch && input.type === 'tel') {
      return 'Please enter a valid phone number.';
    }
    if (input.validity.tooShort) {
      return label + ' needs at least ' + input.minLength + ' characters.';
    }
    if (input.validity.patternMismatch) {
      return input.getAttribute('data-pattern-message') || 'Please check the format of ' + label.toLowerCase() + '.';
    }
    return 'Please check ' + label.toLowerCase() + '.';
  };

  var showError = function (input, message) {
    var field = input.closest('.field') || input.closest('fieldset');
    if (!field) return;
    field.classList.add('has-error');
    var box = field.querySelector('.field__error');
    if (box) box.innerHTML = ERROR_ICON + '<span>' + message + '</span>';
    input.setAttribute('aria-invalid', 'true');
  };

  var clearError = function (input) {
    var field = input.closest('.field') || input.closest('fieldset');
    if (!field) return;
    field.classList.remove('has-error');
    input.removeAttribute('aria-invalid');
  };

  var setStatus = function (form, kind, message) {
    var status = form.querySelector('.form__status');
    if (!status) return;
    status.className = 'form__status is-visible form__status--' + kind;
    status.innerHTML = ERROR_ICON + '<span>' + message + '</span>';
  };

  /* Builds a readable plain-text email body from the form's own labels, so the
     pharmacy receives something legible rather than a query string. */
  var composeBody = function (form) {
    var lines = [];
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name || el.type === 'submit') return;
      if ((el.type === 'radio' || el.type === 'checkbox') && !el.checked) return;
      var label = el.getAttribute('data-label') || el.name;
      var value = (el.value || '').trim();
      if (!value) return;
      lines.push(label + ': ' + value);
    });
    return lines.join('\n');
  };

  Array.prototype.forEach.call(document.querySelectorAll('form[data-mode]'), function (form) {
    // Let this script own validation messaging rather than the browser's bubbles.
    form.setAttribute('novalidate', 'novalidate');

    // Clear an error as soon as the visitor fixes it.
    form.addEventListener('input', function (e) {
      if (e.target.willValidate && e.target.checkValidity()) clearError(e.target);
    });

    form.addEventListener('submit', function (e) {
      var invalid = [];

      Array.prototype.forEach.call(form.elements, function (el) {
        if (!el.willValidate) return;
        if (el.checkValidity()) {
          clearError(el);
        } else {
          showError(el, messageFor(el));
          invalid.push(el);
        }
      });

      if (invalid.length) {
        e.preventDefault();
        setStatus(
          form,
          'error',
          invalid.length === 1
            ? 'One field needs attention before this can be sent.'
            : invalid.length + ' fields need attention before this can be sent.'
        );
        invalid[0].focus();
        invalid[0].scrollIntoView({ block: 'center', behavior: 'smooth' });
        return;
      }

      if (form.getAttribute('data-mode') !== 'mailto') return;   // let a real backend take it

      e.preventDefault();
      var to = form.getAttribute('data-mailto') || 'david@kaikourapharmacy.co.nz';
      var subject = form.getAttribute('data-subject') || 'Website enquiry';
      window.location.href =
        'mailto:' + to +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(composeBody(form));

      setStatus(
        form,
        'success',
        'Your email programme should now be open with this message ready to send. ' +
        'If nothing happened, please call us on (03) 319 5035 instead.'
      );
    });
  });
})();
