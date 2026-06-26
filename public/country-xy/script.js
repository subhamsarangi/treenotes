$(function () {
  const STORAGE_KEY = "clpg_state";

  // Global variables for active sequence state
  let CURRENT_STEPS = [];
  let CURRENT_PLACEHOLDERS = [];
  let CURRENT_PLACEHOLDERS_INFO = {};
  let CURRENT_FILE = "";

  // Dynamic placeholder animation cleanup list
  let PLACEHOLDER_ANIMATORS = [];

  /* ─── State helpers ─────────────────────────────────────────────── */

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function clearState() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function isCopied(state, stepIndex) {
    return (
      Array.isArray(state.copiedSteps) &&
      state.copiedSteps.indexOf(stepIndex) !== -1
    );
  }

  function markCopied(stepIndex) {
    const s = loadState();
    if (!s) return;
    if (!Array.isArray(s.copiedSteps)) s.copiedSteps = [];
    if (s.copiedSteps.indexOf(stepIndex) === -1) s.copiedSteps.push(stepIndex);
    saveState(s);
  }

  /* ─── Validation & Parsing ───────────────────────────────────────── */

  function validateSteps(steps, placeholdersInfo, filename) {
    if (!Array.isArray(steps)) {
      throw new Error(`The file '${filename}' does not contain a valid array of steps.`);
    }
    if (steps.length === 0) {
      throw new Error(`The file '${filename}' contains an empty steps array.`);
    }
    steps.forEach((step, idx) => {
      if (typeof step !== 'object' || step === null) {
        throw new Error(`Step at index ${idx} in '${filename}' is not a valid object.`);
      }
      const required = ['label', 'model', 'thinking', 'prompt'];
      required.forEach(key => {
        if (!(key in step)) {
          throw new Error(`Step at index ${idx} in '${filename}' is missing the required key '${key}'.`);
        }
        if (typeof step[key] !== 'string') {
          throw new Error(`Step at index ${idx} in '${filename}' has key '${key}' which is not a string.`);
        }
      });
    });

    // Validate the placeholders examples object
    if (typeof placeholdersInfo !== 'object' || placeholdersInfo === null) {
      throw new Error(`The file '${filename}' does not contain a valid placeholders object.`);
    }

    const keys = Object.keys(placeholdersInfo);
    if (keys.length === 0) {
      throw new Error(`The file '${filename}' placeholders object must have at least one placeholder definition.`);
    }

    keys.forEach(ph => {
      const examples = placeholdersInfo[ph];
      if (!Array.isArray(examples) || examples.length === 0) {
        throw new Error(`The file '${filename}' placeholder "${ph}" examples must be a non-empty array.`);
      }
      examples.forEach((ex, idx) => {
        if (typeof ex !== 'string') {
          throw new Error(`The file '${filename}' placeholder "${ph}" example at index ${idx} must be a string.`);
        }
      });

      // Verify that this placeholder is actually used in the prompt steps (helps catch typos in keys)
      const isUsed = steps.some(step => (step.prompt || "").includes(`[${ph}]`));
      if (!isUsed) {
        throw new Error(`The file '${filename}' placeholder "${ph}" is defined in examples but never used as "[${ph}]" in any step prompt.`);
      }
    });

    return true;
  }

  function extractPlaceholders(steps, placeholdersInfo) {
    if (!placeholdersInfo || typeof placeholdersInfo !== 'object') return [];
    return Object.keys(placeholdersInfo);
  }

  async function fetchStepFiles() {
    try {
      const response = await fetch('/country-xy/steps/');
      if (!response.ok || response.redirected || (response.url && response.url.indexOf('/login') !== -1)) {
        throw new Error(`Failed to fetch steps directory: redirect or error status`);
      }
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      let files = Array.from(doc.querySelectorAll('a'))
        .map(a => a.getAttribute('href'))
        .filter(href => href && href.endsWith('.js'));
        
      files = files.map(href => {
        const parts = href.split('/');
        return decodeURIComponent(parts[parts.length - 1]);
      });
      
      return Array.from(new Set(files)).sort();
    } catch (err) {
      console.warn("Could not fetch directory listing, using fallback list:", err);
      return [
        'HISTORICAL_PERSON_PROFILE.js',
        'INTRA_COUNTRY_LEARNING.js',
        'MODERN_SOLUTION_HISTORICAL_PERSON.js'
      ];
    }
  }

  async function loadAndValidateStepFile(fileName) {
    const response = await fetch(`/country-xy/steps/${fileName}`);
    if (!response.ok) {
      throw new Error(`Failed to download steps file: ${fileName}`);
    }
    const code = await response.text();
    
    // Extract steps variable name
    const stepsVarMatch = code.match(/const\s+(STEPS_[a-zA-Z0-9_]+)\s*=/);
    if (!stepsVarMatch) {
      throw new Error(`Could not find a valid STEPS_ const declaration in ${fileName}`);
    }
    const stepsVarName = stepsVarMatch[1];
    
    // Extract placeholders examples variable name
    const phVarMatch = code.match(/const\s+(PLACEHOLDERS_[a-zA-Z0-9_]+)\s*=/);
    if (!phVarMatch) {
      throw new Error(`Could not find a valid PLACEHOLDERS_ const declaration in ${fileName}`);
    }
    const phVarName = phVarMatch[1];
    
    // Assign variables to window directly
    let rewrittenCode = code;
    rewrittenCode = rewrittenCode.replace(/const\s+(STEPS_[a-zA-Z0-9_]+)\s*=/, "window.$1 =");
    rewrittenCode = rewrittenCode.replace(/const\s+(PLACEHOLDERS_[a-zA-Z0-9_]+)\s*=/, "window.$1 =");
    
    const script = document.createElement('script');
    script.text = rewrittenCode;
    document.head.appendChild(script);
    document.head.removeChild(script);
    
    const steps = window[stepsVarName];
    const placeholdersInfo = window[phVarName];
    
    if (!steps) {
      throw new Error(`Failed to assign global variable window.${stepsVarName} from ${fileName}`);
    }
    if (!placeholdersInfo) {
      throw new Error(`Failed to assign global variable window.${phVarName} from ${fileName}`);
    }
    
    validateSteps(steps, placeholdersInfo, fileName);
    return { steps, placeholdersInfo };
  }

  /* ─── UI Rendering & Form Generation ────────────────────────────── */

  function clearError() {
    $("#error-container").empty();
  }
  
  function displayError(message) {
    const alertHtml = `
      <div class="alert alert-danger alert-dismissible fade show" role="alert">
        <strong>File Validation Error:</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
    $("#error-container").html(alertHtml);
  }

  function clearPlaceholderAnimators() {
    PLACEHOLDER_ANIMATORS.forEach(cleanup => cleanup());
    PLACEHOLDER_ANIMATORS = [];
  }

  function animatePlaceholder(inputEl, examples) {
    if (!examples || examples.length === 0) return () => {};
    let exampleIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let timeoutId = null;
    
    function tick() {
      // Pause typing if the user is currently editing or if the input is not empty
      if (inputEl === document.activeElement || inputEl.value.trim() !== "") {
        inputEl.setAttribute('placeholder', '');
        timeoutId = setTimeout(tick, 500);
        return;
      }

      const fullText = examples[exampleIdx];
      
      if (isDeleting) {
        charIdx--;
      } else {
        charIdx++;
      }

      inputEl.setAttribute('placeholder', fullText.substring(0, charIdx));
      
      let delta = 80 - Math.random() * 30; // Typing speed
      
      if (isDeleting) {
        delta /= 2; // Delete faster
      }
      
      if (!isDeleting && charIdx === fullText.length) {
        isDeleting = true;
        delta = 1500; // Pause showing full word
      } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        exampleIdx = (exampleIdx + 1) % examples.length;
        delta = 500; // Pause showing empty placeholder before typing next word
      }
      
      timeoutId = setTimeout(tick, delta);
    }
    
    tick();
    
    return () => {
      clearTimeout(timeoutId);
      inputEl.setAttribute('placeholder', '');
    };
  }

  function renderForm(placeholders, placeholdersInfo) {
    clearPlaceholderAnimators();
    const $row = $("#dynamic-inputs-row");
    $row.find(".dynamic-col").remove(); // Clear previous inputs
    
    placeholders.forEach((ph, idx) => {
      const id = "input-" + ph.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
      
      const colHtml = `
        <div class="col-sm-4 dynamic-col">
          <label for="${id}" class="form-label ph-color-${idx}">${ph}</label>
          <input type="text" id="${id}" class="form-control dynamic-input ph-color-${idx}" data-placeholder="${ph}" required />
        </div>
      `;
      $row.find("#button-col").before(colHtml);

      // Start the animated typewriter placeholders
      const examples = placeholdersInfo[ph] || [];
      const inputEl = document.getElementById(id);
      if (inputEl && examples.length > 0) {
        const cleanup = animatePlaceholder(inputEl, examples);
        PLACEHOLDER_ANIMATORS.push(cleanup);
      }
    });
  }

  function updateSubheading(placeholders) {
    if (placeholders.length === 0) {
      $("#subheading-text").text("Select a sequence type to begin.");
      return;
    }
    let text = "Enter ";
    if (placeholders.length === 1) {
      text += placeholders[0];
    } else {
      text += placeholders.slice(0, -1).join(", ") + " and " + placeholders[placeholders.length - 1];
    }
    text += " to generate a step-by-step research prompt sequence.";
    $("#subheading-text").text(text);
  }

  /* ─── Prompt builder ────────────────────────────────────────────── */

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function buildHighlightedPrompt(template, valuesMap, placeholders) {
    let plain = template;
    placeholders.forEach(ph => {
      const val = valuesMap[ph] || `[${ph}]`;
      const regex = new RegExp(`\\[${ph}\\]`, 'g');
      plain = plain.replace(regex, val);
    });

    let escaped = escapeHtml(plain);

    function reEscape(s) {
      return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    const placeholdersMap = {};
    placeholders.forEach((ph, idx) => {
      const val = valuesMap[ph] || "";
      if (!val) return;
      const escapedVal = escapeHtml(val);
      const phKey = `\x00PH_${idx}\x00`;
      placeholdersMap[phKey] = `<span class="ph-color-${idx}">${escapedVal}</span>`;
      
      const valRe = new RegExp(reEscape(escapedVal), "g");
      escaped = escaped.replace(valRe, phKey);
    });

    let result = escaped;
    Object.keys(placeholdersMap).forEach(key => {
      const regex = new RegExp(key, 'g');
      result = result.replace(regex, placeholdersMap[key]);
    });

    return result.replace(/\n/g, "<br>");
  }

  function getPlainText(template, valuesMap, placeholders) {
    let plain = template;
    placeholders.forEach(ph => {
      const val = valuesMap[ph] || `[${ph}]`;
      const regex = new RegExp(`\\[${ph}\\]`, 'g');
      plain = plain.replace(regex, val);
    });
    return plain;
  }

  /* ─── UI Control ────────────────────────────────────────────────── */

  function showPromptSection(stepIndex, valuesMap) {
    const s = loadState();
    const step = CURRENT_STEPS[stepIndex];
    const isLast = stepIndex === CURRENT_STEPS.length - 1;
    const alreadyCopied = s ? isCopied(s, stepIndex) : false;

    const cleanLabel = step.label.replace(/^#\d+\s+/, '');
    const totalSteps = CURRENT_STEPS.length;
    const progressPercent = ((stepIndex + 1) / totalSteps) * 100;
    
    $("#step-progress-bar").css("width", `${progressPercent}%`);
    $("#step-progress-text").text(`Step ${stepIndex + 1} of ${totalSteps}`);
    $("#step-title").text(cleanLabel);
    $("#prompt-text").html(buildHighlightedPrompt(step.prompt, valuesMap, CURRENT_PLACEHOLDERS));
    
    // Set Model and Thinking badges
    $("#model-val").text(step.model || "N/A");
    $("#thinking-val").text(step.thinking || "N/A");

    $("#btn-next")
      .text(isLast ? "Finish" : "Next")
      .prop("disabled", !alreadyCopied);

    if (alreadyCopied) {
      $("#btn-copy")
        .text("Copied ✓")
        .removeClass("btn-outline-dark")
        .addClass("btn-success");
    } else {
      $("#btn-copy")
        .text("Copy prompt")
        .removeClass("btn-success")
        .addClass("btn-outline-dark")
        .css("color", "");
    }

    stepIndex > 0
      ? $("#btn-back").removeClass("invisible")
      : $("#btn-back").addClass("invisible");

    $("#prompt-section").removeClass("d-none");
    $("#action-bar").removeClass("d-none");
  }

  function lockForm(valuesMap) {
    clearPlaceholderAnimators();
    $(".dynamic-input").each(function () {
      const ph = $(this).attr("data-placeholder");
      $(this).val(valuesMap[ph] || "").prop("readonly", true);
    });
    $("#btn-submit").prop("disabled", true);
    $("#btn-reset").prop("disabled", false);
    
    // Disable heading dropdown toggle
    $("#heading-dropdown-trigger")
      .removeAttr("data-bs-toggle")
      .addClass("disabled-dropdown")
      .css("cursor", "default");
  }

  function resetUI() {
    clearState();
    clearPlaceholderAnimators();
    $(".dynamic-input").val("").prop("readonly", false);
    $("#btn-submit").prop("disabled", false);
    $("#btn-reset").prop("disabled", true);
    
    // Re-enable heading dropdown toggle
    $("#heading-dropdown-trigger")
      .attr("data-bs-toggle", "dropdown")
      .removeClass("disabled-dropdown")
      .css("cursor", "pointer");

    $("#prompt-section").addClass("d-none");
    $("#action-bar").addClass("d-none");
    $("#btn-next").prop("disabled", true);

    // Restart typewriter animations for cleared inputs
    if (CURRENT_PLACEHOLDERS && CURRENT_PLACEHOLDERS_INFO) {
      CURRENT_PLACEHOLDERS.forEach((ph, idx) => {
        const id = "input-" + ph.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
        const examples = CURRENT_PLACEHOLDERS_INFO[ph] || [];
        const inputEl = document.getElementById(id);
        if (inputEl && examples.length > 0) {
          const cleanup = animatePlaceholder(inputEl, examples);
          PLACEHOLDER_ANIMATORS.push(cleanup);
        }
      });
    }
  }

  /* ─── Toast helper ──────────────────────────────────────────────── */

  function showToast() {
    const toastEl = document.getElementById("copy-toast");
    const toast = bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 2000 });
    toast.show();
  }

  /* ─── File selection controller ──────────────────────────────────── */

  async function selectStepFile(fileName, savedState = null) {
    clearError();
    try {
      const { steps, placeholdersInfo } = await loadAndValidateStepFile(fileName);
      CURRENT_STEPS = steps;
      CURRENT_FILE = fileName;
      CURRENT_PLACEHOLDERS = extractPlaceholders(steps, placeholdersInfo);
      CURRENT_PLACEHOLDERS_INFO = placeholdersInfo;
      
      // Update Heading Text dynamically based on selected filename
      const displayName = fileName
        .replace(/\.js$/, '')
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, c => c.toUpperCase());
      $("#heading-text").text(displayName);
      
      renderForm(CURRENT_PLACEHOLDERS, CURRENT_PLACEHOLDERS_INFO);
      updateSubheading(CURRENT_PLACEHOLDERS);
      
      if (savedState && savedState.selectedFile === fileName) {
        lockForm(savedState.valuesMap);
        showPromptSection(savedState.stepIndex || 0, savedState.valuesMap);
      } else {
        resetUI();
      }
    } catch (err) {
      console.error(err);
      displayError(err.message);
      $("#dynamic-inputs-row").find(".dynamic-col").remove();
      $("#subheading-text").text("Error loading steps configuration.");
      resetUI();
    }
  }

  /* ─── Event Handlers ────────────────────────────────────────────── */

  $("#country-form").on("submit", function (e) {
    e.preventDefault();
    const valuesMap = {};
    let allValid = true;
    
    $(".dynamic-input").each(function () {
      const ph = $(this).attr("data-placeholder");
      const val = $(this).val().trim();
      if (!val) allValid = false;
      valuesMap[ph] = val;
    });
    
    if (!allValid) return;

    const state = { 
      selectedFile: CURRENT_FILE,
      valuesMap: valuesMap, 
      stepIndex: 0, 
      copiedSteps: [] 
    };
    saveState(state);
    lockForm(valuesMap);
    showPromptSection(0, valuesMap);
  });

  $("#btn-reset").on("click", function () {
    resetUI();
  });

  $("#btn-copy").on("click", function () {
    const s = loadState();
    if (!s) return;
    const step = CURRENT_STEPS[s.stepIndex];
    const text = getPlainText(step.prompt, s.valuesMap, CURRENT_PLACEHOLDERS);

    function onCopied() {
      showToast();
      $("#btn-copy")
        .text("Copied ✓")
        .removeClass("btn-outline-dark")
        .addClass("btn-success");
      setTimeout(function () {
        markCopied(s.stepIndex);
        $("#btn-next").prop("disabled", false);
      }, 3000);
    }

    navigator.clipboard
      .writeText(text)
      .then(onCopied)
      .catch(function () {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        onCopied();
      });
  });

  $("#btn-back").on("click", function () {
    const s = loadState();
    if (!s || s.stepIndex <= 0) return;

    s.stepIndex--;
    saveState(s);
    showPromptSection(s.stepIndex, s.valuesMap);
  });

  $("#btn-next").on("click", function () {
    const s = loadState();
    if (!s) return;

    const nextIndex = s.stepIndex + 1;

    if (nextIndex >= CURRENT_STEPS.length) {
      resetUI();
      return;
    }

    s.stepIndex = nextIndex;
    saveState(s);
    showPromptSection(nextIndex, s.valuesMap);
  });

  /* ─── Initialization ─────────────────────────────────────────────── */

  async function init() {
    const files = await fetchStepFiles();
    const $menu = $("#step-file-select-menu");
    $menu.empty();
    
    files.forEach(file => {
      const displayName = file
        .replace(/\.js$/, '')
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, c => c.toUpperCase());
      $menu.append(`<li><a class="dropdown-item" href="#" data-value="${file}">${displayName}</a></li>`);
    });
    
    const saved = loadState();
    let fileToLoad = files[0];
    if (saved && saved.selectedFile && files.indexOf(saved.selectedFile) !== -1) {
      fileToLoad = saved.selectedFile;
    }
    
    if (fileToLoad) {
      $menu.find(`.dropdown-item[data-value="${fileToLoad}"]`).addClass("active");
      await selectStepFile(fileToLoad, saved);
    }
    
    $menu.on("click", ".dropdown-item", async function (e) {
      e.preventDefault();
      const val = $(this).attr("data-value");
      
      $menu.find(".dropdown-item").removeClass("active");
      $(this).addClass("active");
      
      await selectStepFile(val);
    });
  }

  // Kick off application boot
  init();
});
