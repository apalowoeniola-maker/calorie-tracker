/**
 * CaloriePulse - Pure Vanilla JavaScript Application
 * Persistent client-side nutrition & calorie tracker with LocalStorage.
 * Strictly no frameworks, no backend dependencies.
 */

(function () {
  'use strict';

  // --- Storage Keys ---
  const STORAGE_KEY_DAYS = 'caloriepulse_days_v1';
  const STORAGE_KEY_GOALS = 'caloriepulse_goals_v1';
  const STORAGE_KEY_INIT = 'caloriepulse_initialized_v1';

  // --- Default Settings ---
  const DEFAULT_GOALS = {
    calories: 2000,
    protein: 140, // grams
    carbs: 220,   // grams
    fat: 65,      // grams
    water: 8      // glasses (250ml each)
  };

  // --- Preset Common Foods ---
  const PRESET_FOODS = [
    { name: 'Boiled Eggs (2)', calories: 156, protein: 12.6, carbs: 1.1, fat: 10.6, serving: '2 large' },
    { name: 'Oatmeal with Milk', calories: 280, protein: 11, carbs: 45, fat: 5.5, serving: '1 bowl (250g)' },
    { name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fat: 0.3, serving: '1 medium (118g)' },
    { name: 'Grilled Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, serving: '100g' },
    { name: 'Steamed Brown Rice', calories: 216, protein: 5, carbs: 45, fat: 1.8, serving: '1 cup cooked' },
    { name: 'Baked Salmon Fillet', calories: 240, protein: 25, carbs: 0, fat: 14, serving: '120g' },
    { name: 'Greek Yogurt (Plain)', calories: 130, protein: 15, carbs: 6, fat: 4.5, serving: '170g' },
    { name: 'Whey Protein Shake', calories: 140, protein: 25, carbs: 3, fat: 2, serving: '1 scoop with water' },
    { name: 'Peanut Butter Toast', calories: 260, protein: 9, carbs: 26, fat: 14, serving: '1 slice' },
    { name: 'Fresh Apple', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, serving: '1 medium' },
    { name: 'Avocado Half', calories: 160, protein: 2, carbs: 8.5, fat: 14.7, serving: '1/2 medium' },
    { name: 'Mixed Green Salad', calories: 85, protein: 2, carbs: 6, fat: 6, serving: '1 bowl with olive oil' }
  ];

  // --- Application State ---
  const state = {
    selectedDate: getTodayDateString(),
    goals: loadGoals(),
    days: loadDays()
  };

  // --- Initial Launch Setup ---
  function init() {
    seedInitialDemoDataIfEmpty();
    bindEvents();
    renderDateControls();
    renderPresetChips();
    renderAll();
  }

  // --- Date Utility Helpers ---
  function getTodayDateString() {
    const today = new Date();
    return formatDateToString(today);
  }

  function formatDateToString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function parseDateString(dateStr) {
    const parts = dateStr.split('-');
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  // --- Storage Management ---
  function loadGoals() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_GOALS);
      if (saved) {
        return { ...DEFAULT_GOALS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Could not read goals from localStorage:', e);
    }
    return { ...DEFAULT_GOALS };
  }

  function saveGoals(goals) {
    try {
      localStorage.setItem(STORAGE_KEY_GOALS, JSON.stringify(goals));
      state.goals = goals;
    } catch (e) {
      console.error('Failed to save goals:', e);
    }
  }

  function loadDays() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DAYS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read days from localStorage:', e);
    }
    return {};
  }

  function saveDays() {
    try {
      localStorage.setItem(STORAGE_KEY_DAYS, JSON.stringify(state.days));
    } catch (e) {
      console.error('Failed to save days:', e);
    }
  }

  function getDayData(dateStr) {
    if (!state.days[dateStr]) {
      state.days[dateStr] = {
        foods: [],
        water: 0,
        notes: ''
      };
    }
    return state.days[dateStr];
  }

  // Seed sample initial data on brand new installation so the interface isn't just an empty void
  function seedInitialDemoDataIfEmpty() {
    const initialized = localStorage.getItem(STORAGE_KEY_INIT);
    if (!initialized) {
      const today = getTodayDateString();
      if (!state.days[today] || state.days[today].foods.length === 0) {
        state.days[today] = {
          water: 4,
          notes: 'Goal for today: Drink 8 glasses of water and keep protein over 130g!',
          foods: [
            {
              id: generateId(),
              meal: 'breakfast',
              name: 'Oatmeal with Blueberries & Honey',
              calories: 320,
              protein: 10,
              carbs: 58,
              fat: 5,
              serving: '1 bowl',
              timestamp: Date.now() - 1000 * 60 * 240
            },
            {
              id: generateId(),
              meal: 'breakfast',
              name: 'Boiled Egg',
              calories: 78,
              protein: 6.3,
              carbs: 0.6,
              fat: 5.3,
              serving: '1 large',
              timestamp: Date.now() - 1000 * 60 * 230
            },
            {
              id: generateId(),
              meal: 'lunch',
              name: 'Grilled Chicken with Quinoa & Greens',
              calories: 520,
              protein: 42,
              carbs: 48,
              fat: 14,
              serving: '1 plate',
              timestamp: Date.now() - 1000 * 60 * 60
            }
          ]
        };
        saveDays();
        localStorage.setItem(STORAGE_KEY_INIT, 'true');
      }
    }
  }

  function generateId() {
    return 'item_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
  }

  // --- Rendering Functions ---

  function renderAll() {
    const dayData = getDayData(state.selectedDate);

    renderDashboard(dayData);
    renderWater(dayData);
    renderMeals(dayData);
    renderNotes(dayData);
  }

  function renderDateControls() {
    const dateInput = document.getElementById('dateInput');
    dateInput.value = state.selectedDate;

    // Highlight "Today" button if currently on today
    const todayBtn = document.getElementById('todayBtn');
    if (state.selectedDate === getTodayDateString()) {
      todayBtn.classList.remove('btn-secondary');
      todayBtn.classList.add('btn-primary');
    } else {
      todayBtn.classList.remove('btn-primary');
      todayBtn.classList.add('btn-secondary');
    }
  }

  function renderDashboard(dayData) {
    const foods = dayData.foods || [];

    // Calculate totals
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    foods.forEach(f => {
      totalCalories += Number(f.calories) || 0;
      totalProtein += Number(f.protein) || 0;
      totalCarbs += Number(f.carbs) || 0;
      totalFat += Number(f.fat) || 0;
    });

    const targetCal = state.goals.calories;
    const remainingCal = targetCal - totalCalories;
    const percentCal = targetCal > 0 ? Math.round((totalCalories / targetCal) * 100) : 0;

    // Update Calorie Numbers
    document.getElementById('targetCaloriesVal').textContent = `${targetCal.toLocaleString()} kcal`;
    document.getElementById('consumedCaloriesVal').textContent = `${totalCalories.toLocaleString()} kcal`;
    document.getElementById('caloriePercentVal').textContent = `${percentCal}%`;

    const remainingElem = document.getElementById('remainingCaloriesVal');
    const labelElem = document.getElementById('remainingCaloriesLabel');
    const badgeElem = document.getElementById('calorieStatusBadge');
    const circleProgress = document.getElementById('calorieCircleProgress');
    const linearBar = document.getElementById('calorieLinearBar');

    const circumference = 2 * Math.PI * 70; // 439.82

    if (remainingCal >= 0) {
      remainingElem.textContent = remainingCal.toLocaleString();
      labelElem.textContent = 'Remaining';
      badgeElem.className = 'badge badge-success';
      badgeElem.textContent = 'On Track';

      circleProgress.style.stroke = '#0284c7';
      linearBar.style.backgroundColor = '#0284c7';

      const progressRatio = Math.min(totalCalories / targetCal, 1);
      const strokeOffset = circumference - (circumference * progressRatio);
      circleProgress.style.strokeDashoffset = strokeOffset;
      linearBar.style.width = `${Math.min(percentCal, 100)}%`;
    } else {
      const overAmount = Math.abs(remainingCal);
      remainingElem.textContent = `+${overAmount.toLocaleString()}`;
      labelElem.textContent = 'Over Target';
      badgeElem.className = 'badge badge-danger';
      badgeElem.textContent = `+${overAmount} Over`;

      circleProgress.style.stroke = '#ef4444';
      linearBar.style.backgroundColor = '#ef4444';
      circleProgress.style.strokeDashoffset = '0';
      linearBar.style.width = '100%';
    }

    // Update Macronutrient Bars
    const targetP = state.goals.protein || 1;
    const targetC = state.goals.carbs || 1;
    const targetF = state.goals.fat || 1;

    document.getElementById('proteinConsumedVal').textContent = Math.round(totalProtein);
    document.getElementById('proteinTargetVal').textContent = targetP;
    const pPct = Math.round((totalProtein / targetP) * 100);
    document.getElementById('proteinPercentVal').textContent = `(${pPct}%)`;
    document.getElementById('proteinProgressBar').style.width = `${Math.min(pPct, 100)}%`;

    document.getElementById('carbsConsumedVal').textContent = Math.round(totalCarbs);
    document.getElementById('carbsTargetVal').textContent = targetC;
    const cPct = Math.round((totalCarbs / targetC) * 100);
    document.getElementById('carbsPercentVal').textContent = `(${cPct}%)`;
    document.getElementById('carbsProgressBar').style.width = `${Math.min(cPct, 100)}%`;

    document.getElementById('fatConsumedVal').textContent = Math.round(totalFat);
    document.getElementById('fatTargetVal').textContent = targetF;
    const fPct = Math.round((totalFat / targetF) * 100);
    document.getElementById('fatPercentVal').textContent = `(${fPct}%)`;
    document.getElementById('fatProgressBar').style.width = `${Math.min(fPct, 100)}%`;

    // Energy Ratio (Protein = 4 cal/g, Carbs = 4 cal/g, Fat = 9 cal/g)
    const pCals = totalProtein * 4;
    const cCals = totalCarbs * 4;
    const fCals = totalFat * 9;
    const macroCalsSum = pCals + cCals + fCals;

    let pRatio = 0, cRatio = 0, fRatio = 0;
    if (macroCalsSum > 0) {
      pRatio = Math.round((pCals / macroCalsSum) * 100);
      cRatio = Math.round((cCals / macroCalsSum) * 100);
      fRatio = 100 - (pRatio + cRatio);
      if (fRatio < 0) fRatio = 0;
    }

    document.getElementById('energyProteinPct').textContent = `${pRatio}% P`;
    document.getElementById('energyCarbsPct').textContent = `${cRatio}% C`;
    document.getElementById('energyFatPct').textContent = `${fRatio}% F`;
  }

  function renderWater(dayData) {
    const glassesContainer = document.getElementById('waterGlassesContainer');
    glassesContainer.innerHTML = '';

    const currentCount = Number(dayData.water) || 0;
    const goalCount = Number(state.goals.water) || 8;

    document.getElementById('waterCountDisplay').textContent = currentCount;
    document.getElementById('waterGoalDisplay').textContent = goalCount;

    // Render glass indicators
    const displayGlasses = Math.max(goalCount, currentCount);
    for (let i = 1; i <= displayGlasses; i++) {
      const glass = document.createElement('div');
      glass.className = 'water-glass-icon' + (i <= currentCount ? ' filled' : '');
      glass.title = `Glass #${i} (250ml) - Click to toggle`;

      const fill = document.createElement('div');
      fill.className = 'water-glass-fill';
      glass.appendChild(fill);

      glass.addEventListener('click', () => {
        setWaterCount(i === currentCount ? i - 1 : i);
      });

      glassesContainer.appendChild(glass);
    }
  }

  function setWaterCount(newCount) {
    const dayData = getDayData(state.selectedDate);
    dayData.water = Math.max(0, newCount);
    saveDays();
    renderWater(dayData);
  }

  function renderMeals(dayData) {
    const meals = ['breakfast', 'lunch', 'dinner', 'snacks'];
    const foods = dayData.foods || [];

    meals.forEach(meal => {
      const listElement = document.getElementById(`${meal}FoodList`);
      const summaryElement = document.getElementById(`${meal}MacrosSummary`);
      listElement.innerHTML = '';

      const mealFoods = foods.filter(f => f.meal === meal);

      // Meal totals
      let mealCals = 0;
      let mealP = 0;
      let mealC = 0;
      let mealF = 0;

      mealFoods.forEach(f => {
        mealCals += Number(f.calories) || 0;
        mealP += Number(f.protein) || 0;
        mealC += Number(f.carbs) || 0;
        mealF += Number(f.fat) || 0;
      });

      summaryElement.textContent = `${mealCals.toLocaleString()} kcal • ${Math.round(mealP)}g P • ${Math.round(mealC)}g C • ${Math.round(mealF)}g F`;

      if (mealFoods.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty-meal-state';
        empty.textContent = `No items logged for ${meal} yet.`;
        listElement.appendChild(empty);
      } else {
        mealFoods.forEach(item => {
          const row = document.createElement('div');
          row.className = 'food-item-row';

          // Left: details
          const details = document.createElement('div');
          details.className = 'food-details';

          const titleRow = document.createElement('div');
          titleRow.className = 'food-title-row';

          const name = document.createElement('span');
          name.className = 'food-name';
          name.textContent = item.name;
          titleRow.appendChild(name);

          if (item.serving && item.serving.trim()) {
            const portion = document.createElement('span');
            portion.className = 'food-portion';
            portion.textContent = `(${item.serving.trim()})`;
            titleRow.appendChild(portion);
          }
          details.appendChild(titleRow);

          // Macro pills
          const macroPills = document.createElement('div');
          macroPills.className = 'food-macro-pills';

          if (item.protein > 0) {
            const p = document.createElement('span');
            p.className = 'macro-mini-pill pill-p';
            p.textContent = `${item.protein}g P`;
            macroPills.appendChild(p);
          }
          if (item.carbs > 0) {
            const c = document.createElement('span');
            c.className = 'macro-mini-pill pill-c';
            c.textContent = `${item.carbs}g C`;
            macroPills.appendChild(c);
          }
          if (item.fat > 0) {
            const f = document.createElement('span');
            f.className = 'macro-mini-pill pill-f';
            f.textContent = `${item.fat}g F`;
            macroPills.appendChild(f);
          }
          details.appendChild(macroPills);

          row.appendChild(details);

          // Right: calories badge & actions
          const rightGroup = document.createElement('div');
          rightGroup.className = 'food-right-group';

          const calPill = document.createElement('span');
          calPill.className = 'food-calories-pill';
          calPill.textContent = `${Number(item.calories).toLocaleString()} kcal`;
          rightGroup.appendChild(calPill);

          const actions = document.createElement('div');
          actions.className = 'food-actions';

          const editBtn = document.createElement('button');
          editBtn.className = 'btn-item-action';
          editBtn.title = 'Edit item';
          editBtn.innerHTML = '✏️';
          editBtn.addEventListener('click', () => openEditFoodModal(item));

          const delBtn = document.createElement('button');
          delBtn.className = 'btn-item-action delete-action';
          delBtn.title = 'Delete item';
          delBtn.innerHTML = '🗑️';
          delBtn.addEventListener('click', () => deleteFoodItem(item.id));

          actions.appendChild(editBtn);
          actions.appendChild(delBtn);
          rightGroup.appendChild(actions);

          row.appendChild(rightGroup);
          listElement.appendChild(row);
        });
      }
    });
  }

  function renderNotes(dayData) {
    const notesInput = document.getElementById('dailyNotesInput');
    notesInput.value = dayData.notes || '';
  }

  function renderPresetChips() {
    const container = document.getElementById('presetPillsContainer');
    container.innerHTML = '';

    PRESET_FOODS.forEach(preset => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'preset-chip';
      chip.innerHTML = `${preset.name} <span class="preset-cal">${preset.calories} cal</span>`;

      chip.addEventListener('click', () => {
        // Quick add preset to appropriate meal
        let targetMeal = 'snacks';
        const nameLower = preset.name.toLowerCase();
        if (nameLower.includes('egg') || nameLower.includes('oat') || nameLower.includes('toast')) {
          targetMeal = 'breakfast';
        } else if (nameLower.includes('chicken') || nameLower.includes('rice') || nameLower.includes('salad')) {
          targetMeal = 'lunch';
        } else if (nameLower.includes('salmon')) {
          targetMeal = 'dinner';
        }

        const newItem = {
          id: generateId(),
          meal: targetMeal,
          name: preset.name,
          calories: preset.calories,
          protein: preset.protein,
          carbs: preset.carbs,
          fat: preset.fat,
          serving: preset.serving,
          timestamp: Date.now()
        };

        const dayData = getDayData(state.selectedDate);
        dayData.foods.push(newItem);
        saveDays();
        renderAll();
        showToast(`Added ${preset.name} to ${capitalize(targetMeal)}`, 'success');
      });

      container.appendChild(chip);
    });
  }

  // --- Food Operations ---

  function openAddFoodModal(meal = 'breakfast') {
    document.getElementById('foodModalTitle').textContent = 'Log Food Item';
    document.getElementById('foodEditId').value = '';
    document.getElementById('foodMealSelect').value = meal;
    document.getElementById('foodNameInput').value = '';
    document.getElementById('foodCaloriesInput').value = '';
    document.getElementById('foodServingInput').value = '';
    document.getElementById('foodProteinInput').value = '';
    document.getElementById('foodCarbsInput').value = '';
    document.getElementById('foodFatInput').value = '';

    openModal('foodModal');
    setTimeout(() => document.getElementById('foodNameInput').focus(), 50);
  }

  function openEditFoodModal(item) {
    document.getElementById('foodModalTitle').textContent = 'Edit Food Item';
    document.getElementById('foodEditId').value = item.id;
    document.getElementById('foodMealSelect').value = item.meal;
    document.getElementById('foodNameInput').value = item.name;
    document.getElementById('foodCaloriesInput').value = item.calories;
    document.getElementById('foodServingInput').value = item.serving || '';
    document.getElementById('foodProteinInput').value = item.protein !== undefined ? item.protein : '';
    document.getElementById('foodCarbsInput').value = item.carbs !== undefined ? item.carbs : '';
    document.getElementById('foodFatInput').value = item.fat !== undefined ? item.fat : '';

    openModal('foodModal');
    setTimeout(() => document.getElementById('foodNameInput').focus(), 50);
  }

  function saveFoodFromForm(e) {
    e.preventDefault();

    const editId = document.getElementById('foodEditId').value;
    const meal = document.getElementById('foodMealSelect').value;
    const name = document.getElementById('foodNameInput').value.trim();
    const calories = Math.max(0, parseFloat(document.getElementById('foodCaloriesInput').value) || 0);
    const serving = document.getElementById('foodServingInput').value.trim();
    const protein = Math.max(0, parseFloat(document.getElementById('foodProteinInput').value) || 0);
    const carbs = Math.max(0, parseFloat(document.getElementById('foodCarbsInput').value) || 0);
    const fat = Math.max(0, parseFloat(document.getElementById('foodFatInput').value) || 0);

    if (!name) {
      showToast('Please enter a food name.', 'error');
      return;
    }

    const dayData = getDayData(state.selectedDate);

    if (editId) {
      // Update existing item
      const index = dayData.foods.findIndex(f => f.id === editId);
      if (index !== -1) {
        dayData.foods[index] = {
          ...dayData.foods[index],
          meal,
          name,
          calories,
          serving,
          protein,
          carbs,
          fat
        };
        showToast('Food entry updated.', 'success');
      }
    } else {
      // Add new item
      const newItem = {
        id: generateId(),
        meal,
        name,
        calories,
        serving,
        protein,
        carbs,
        fat,
        timestamp: Date.now()
      };
      dayData.foods.push(newItem);
      showToast(`Logged "${name}" (${calories} kcal)`, 'success');
    }

    saveDays();
    closeModal('foodModal');
    renderAll();
  }

  function deleteFoodItem(id) {
    const dayData = getDayData(state.selectedDate);
    const item = dayData.foods.find(f => f.id === id);
    const itemName = item ? item.name : 'item';

    dayData.foods = dayData.foods.filter(f => f.id !== id);
    saveDays();
    renderAll();
    showToast(`Removed "${itemName}"`, 'info');
  }

  function quickAddCalories(amount, meal = 'snacks', customLabel = '') {
    const dayData = getDayData(state.selectedDate);
    const label = customLabel.trim() || `Quick Add (+${amount} kcal)`;
    const newItem = {
      id: generateId(),
      meal: meal,
      name: label,
      calories: amount,
      serving: '',
      protein: 0,
      carbs: 0,
      fat: 0,
      timestamp: Date.now()
    };
    dayData.foods.push(newItem);
    saveDays();
    renderAll();
    showToast(`Added ${amount} kcal to ${capitalize(meal)}`, 'success');
  }

  // --- Goals Modal Operations ---

  function openGoalsModal() {
    document.getElementById('goalCaloriesInput').value = state.goals.calories;
    document.getElementById('goalProteinInput').value = state.goals.protein;
    document.getElementById('goalCarbsInput').value = state.goals.carbs;
    document.getElementById('goalFatInput').value = state.goals.fat;
    document.getElementById('goalWaterInput').value = state.goals.water;

    openModal('goalsModal');
  }

  function saveGoalsFromForm(e) {
    e.preventDefault();

    const calories = Math.max(500, parseInt(document.getElementById('goalCaloriesInput').value, 10) || DEFAULT_GOALS.calories);
    const protein = Math.max(0, parseInt(document.getElementById('goalProteinInput').value, 10) || 0);
    const carbs = Math.max(0, parseInt(document.getElementById('goalCarbsInput').value, 10) || 0);
    const fat = Math.max(0, parseInt(document.getElementById('goalFatInput').value, 10) || 0);
    const water = Math.max(1, parseInt(document.getElementById('goalWaterInput').value, 10) || DEFAULT_GOALS.water);

    const newGoals = { calories, protein, carbs, fat, water };
    saveGoals(newGoals);
    closeModal('goalsModal');
    renderAll();
    showToast('Daily targets saved successfully!', 'success');
  }

  function applyMacroSplit(pPct, cPct, fPct) {
    const totalCal = parseInt(document.getElementById('goalCaloriesInput').value, 10) || state.goals.calories;

    const pGrams = Math.round((totalCal * (pPct / 100)) / 4);
    const cGrams = Math.round((totalCal * (cPct / 100)) / 4);
    const fGrams = Math.round((totalCal * (fPct / 100)) / 9);

    document.getElementById('goalProteinInput').value = pGrams;
    document.getElementById('goalCarbsInput').value = cGrams;
    document.getElementById('goalFatInput').value = fGrams;

    showToast(`Calculated split: ${pGrams}g P, ${cGrams}g C, ${fGrams}g F`, 'info');
  }

  // --- Modal Helpers ---

  function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
    }
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  // --- Toast Notifications ---

  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span> <span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 250);
    }, 3200);
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // --- Backup & Restore ---

  function exportBackupData() {
    const exportObject = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      goals: state.goals,
      days: state.days
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `caloriepulse_backup_${state.selectedDate}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast('Backup file downloaded.', 'success');
  }

  function handleImportFile(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const imported = JSON.parse(e.target.result);
        if (imported && (imported.days || imported.goals)) {
          if (imported.goals) {
            state.goals = { ...DEFAULT_GOALS, ...imported.goals };
            saveGoals(state.goals);
          }
          if (imported.days) {
            state.days = { ...state.days, ...imported.days };
            saveDays();
          }
          renderAll();
          closeModal('dataModal');
          showToast('Data successfully imported and restored!', 'success');
        } else {
          showToast('Invalid backup file structure.', 'error');
        }
      } catch (err) {
        console.error(err);
        showToast('Error parsing JSON backup file.', 'error');
      }
    };
    reader.readAsText(file);
  }

  function resetAllData() {
    if (confirm('Are you sure you want to permanently delete ALL calorie tracking history, meals, and water logs? This cannot be undone.')) {
      state.days = {};
      state.goals = { ...DEFAULT_GOALS };
      saveDays();
      saveGoals(state.goals);
      renderAll();
      closeModal('dataModal');
      showToast('All local data has been reset to defaults.', 'info');
    }
  }

  // --- Event Bindings ---

  function bindEvents() {
    // Date Navigation
    document.getElementById('prevDateBtn').addEventListener('click', () => {
      const current = parseDateString(state.selectedDate);
      current.setDate(current.getDate() - 1);
      state.selectedDate = formatDateToString(current);
      renderDateControls();
      renderAll();
    });

    document.getElementById('nextDateBtn').addEventListener('click', () => {
      const current = parseDateString(state.selectedDate);
      current.setDate(current.getDate() + 1);
      state.selectedDate = formatDateToString(current);
      renderDateControls();
      renderAll();
    });

    document.getElementById('todayBtn').addEventListener('click', () => {
      state.selectedDate = getTodayDateString();
      renderDateControls();
      renderAll();
    });

    document.getElementById('dateInput').addEventListener('change', (e) => {
      if (e.target.value) {
        state.selectedDate = e.target.value;
        renderDateControls();
        renderAll();
      }
    });

    // Header Action Modals
    document.getElementById('openGoalsBtn').addEventListener('click', openGoalsModal);
    document.getElementById('closeGoalsModalBtn').addEventListener('click', () => closeModal('goalsModal'));
    document.getElementById('cancelGoalsBtn').addEventListener('click', () => closeModal('goalsModal'));
    document.getElementById('goalsForm').addEventListener('submit', saveGoalsFromForm);

    // Goal Preset Macro Ratio Buttons
    document.querySelectorAll('.split-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = parseInt(btn.dataset.p, 10);
        const c = parseInt(btn.dataset.c, 10);
        const f = parseInt(btn.dataset.f, 10);
        applyMacroSplit(p, c, f);
      });
    });

    // Add Food Buttons per Meal
    document.querySelectorAll('.open-add-food-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const meal = btn.dataset.meal || 'breakfast';
        openAddFoodModal(meal);
      });
    });

    document.getElementById('closeFoodModalBtn').addEventListener('click', () => closeModal('foodModal'));
    document.getElementById('cancelFoodBtn').addEventListener('click', () => closeModal('foodModal'));
    document.getElementById('foodForm').addEventListener('submit', saveFoodFromForm);

    // Quick Add Modal Trigger & Submit
    document.getElementById('openQuickAddBtn').addEventListener('click', () => {
      document.getElementById('quickAddCaloriesInput').value = '';
      document.getElementById('quickAddLabelInput').value = '';
      openModal('quickAddModal');
      setTimeout(() => document.getElementById('quickAddCaloriesInput').focus(), 50);
    });

    document.getElementById('closeQuickAddModalBtn').addEventListener('click', () => closeModal('quickAddModal'));
    document.getElementById('cancelQuickAddBtn').addEventListener('click', () => closeModal('quickAddModal'));
    document.getElementById('quickAddForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const calories = parseInt(document.getElementById('quickAddCaloriesInput').value, 10);
      const meal = document.getElementById('quickAddMealSelect').value;
      const label = document.getElementById('quickAddLabelInput').value;

      if (calories > 0) {
        quickAddCalories(calories, meal, label);
        closeModal('quickAddModal');
      }
    });

    // Fast Calorie Bump Buttons (+50, +100, +250, +500)
    document.querySelectorAll('.bump-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cal = parseInt(btn.dataset.calories, 10);
        quickAddCalories(cal, 'snacks', `Quick +${cal} kcal`);
      });
    });

    // Water Intake Controls
    document.getElementById('increaseWaterBtn').addEventListener('click', () => {
      const dayData = getDayData(state.selectedDate);
      setWaterCount((Number(dayData.water) || 0) + 1);
      showToast('Hydration logged: +250ml', 'info');
    });

    document.getElementById('decreaseWaterBtn').addEventListener('click', () => {
      const dayData = getDayData(state.selectedDate);
      setWaterCount((Number(dayData.water) || 0) - 1);
    });

    document.getElementById('resetWaterBtn').addEventListener('click', () => {
      setWaterCount(0);
      showToast('Water reset for today.', 'info');
    });

    // Daily Notes Auto-Save
    const notesInput = document.getElementById('dailyNotesInput');
    const indicator = document.getElementById('notesSaveIndicator');
    let notesTimer = null;

    notesInput.addEventListener('input', () => {
      clearTimeout(notesTimer);
      indicator.textContent = 'Saving...';
      indicator.classList.add('visible');

      notesTimer = setTimeout(() => {
        const dayData = getDayData(state.selectedDate);
        dayData.notes = notesInput.value;
        saveDays();
        indicator.textContent = 'Saved';
        setTimeout(() => indicator.classList.remove('visible'), 1500);
      }, 500);
    });

    // Backup & Restore Data Modal
    document.getElementById('openDataBtn').addEventListener('click', () => openModal('dataModal'));
    document.getElementById('closeDataModalBtn').addEventListener('click', () => closeModal('dataModal'));
    document.getElementById('closeDataBtnSecondary').addEventListener('click', () => closeModal('dataModal'));
    document.getElementById('exportDataBtn').addEventListener('click', exportBackupData);

    const fileInput = document.getElementById('importFileInput');
    document.getElementById('triggerImportBtn').addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleImportFile(e.target.files[0]);
        fileInput.value = '';
      }
    });

    document.getElementById('resetAllDataBtn').addEventListener('click', resetAllData);

    // Close modal on click outside modal card
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('active');
          overlay.setAttribute('aria-hidden', 'true');
        }
      });
    });

    // Escape key closes open modals
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(overlay => {
          overlay.classList.remove('active');
          overlay.setAttribute('aria-hidden', 'true');
        });
      }
    });
  }

  // Launch app when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

