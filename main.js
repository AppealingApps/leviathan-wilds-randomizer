const names = {
  "Brick": 2, "Cheer": 3, "Edge": 3, "Fix": 1, 
  "Hazard": 1, "Hornet": 2, "Kestrel": 1, "Mystic": 2
};
const deepvaleNames = { "Savvy": 3 };

const classes = {
  "Breaker": { mobility: 1, power: 4, support: 1, complexity: 1 },
  "Freeclimber": { mobility: 4, power: 1, support: 1, complexity: 1 },
  "Gadgeteer": { mobility: 2, power: 2, support: 2, complexity: 2 },
  "Gambler": { mobility: 2, power: 2, support: 2, complexity: 3 },
  "Herald": { mobility: 2, power: 0, support: 4, complexity: 2 },
  "Magus": { mobility: 2, power: 3, support: 1, complexity: 3 },
  "Mender": { mobility: 1, power: 1, support: 4, complexity: 1 },
  "Roughneck": { mobility: 2, power: 2, support: 2, complexity: 2 }
};
const deepvaleClasses = {
  "Harvester": { mobility: 2, power: 3, support: 1, complexity: 3 }
};

const baseLeviathans = {
  "Avalanche": 2, "Bloom": 3, "Collector": 2, "Deep": 3, "Forsaken": 3, "Fury": 2, "Hive": 2, "Hunger": 3,
  "Sage": 1, "Sentinel": 1, "Storm": 1, "Tunneler": 3, "Twins": 3, "Tyrant": 3, "Vortex": 3, "Watcher": 2, "Weaver": 2 
};
const deepvaleLeviathans = {
  "Architect": 4, "Anomaly": 4, "Dwelling": 3, "Flux": 1, "Infestation": 3, "Keeper": 2, "Ravager": 3
};

function stars(n) {
  return "★".repeat(n);
}

function shuffleArray(array) {
  return array.slice().sort(() => 0.5 - Math.random());
}

function renderComplexityControls() {
  const count = parseInt(document.getElementById("playerCount").value);
  const container = document.getElementById("complexityControls");
  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    container.innerHTML += `
      <div class="player-complexity">
        <strong>Player ${i + 1} Complexity:</strong><br>
        Character: 
        <label>Min <select id="nameMin${i}">${complexityOptions(1)}</select></label>
        <label>Max <select id="nameMax${i}">${complexityOptions(3)}</select></label><br>
        Class: 
        <label>Min <select id="classMin${i}">${complexityOptions(1)}</select></label>
        <label>Max <select id="classMax${i}">${complexityOptions(3)}</select></label>
      </div>
    `;
  }
}

function complexityOptions(defaultVal) {
  return [1, 2, 3, 4].map(i =>
    `<option value="${i}" ${i === defaultVal ? 'selected' : ''}>${i}</option>`
  ).join('');
}

function assignCharacters(existingState = null) {
  const includeDeepvale = document.getElementById("includeDeepvale").checked;
  const playerCount = parseInt(document.getElementById("playerCount").value);
  const allNames = { ...names, ...(includeDeepvale ? deepvaleNames : {}) };
  const allClasses = { ...classes, ...(includeDeepvale ? deepvaleClasses : {}) };
  const allLeviathans = { ...baseLeviathans, ...(includeDeepvale ? deepvaleLeviathans : {}) };

  let selectedPlayers, chosenLeviathan, chosenMutation;

  if (existingState) {
    selectedPlayers = existingState.selectedPlayers;
    chosenLeviathan = existingState.chosenLeviathan;
    chosenMutation = existingState.chosenMutation;
  } else {
    selectedPlayers = [];

    // Create mutable arrays of available names and classes
    let availableNames = Object.entries(allNames);
    let availableClasses = Object.entries(allClasses);

    for (let i = 0; i < playerCount; i++) {
      const nameMin = parseInt(document.getElementById(`nameMin${i}`).value);
      const nameMax = parseInt(document.getElementById(`nameMax${i}`).value);
      const classMin = parseInt(document.getElementById(`classMin${i}`).value);
      const classMax = parseInt(document.getElementById(`classMax${i}`).value);

      // Filter available names and classes by complexity
      const nameOptions = availableNames
        .filter(([_, c]) => c >= nameMin && c <= nameMax)
        .map(([name]) => name);
      const classOptions = availableClasses
        .filter(([_, obj]) => obj.complexity >= classMin && obj.complexity <= classMax)
        .map(([cls]) => cls);

      if (nameOptions.length === 0 || classOptions.length === 0) {
        alert("Not enough unique names or classes for the selected constraints.");
        return;
      }

      const charName = shuffleArray(nameOptions)[0];
      const charClass = shuffleArray(classOptions)[0];
      selectedPlayers.push({ charName, charClass });

      // Remove chosen name and class from available lists
      availableNames = availableNames.filter(([name]) => name !== charName);
      availableClasses = availableClasses.filter(([cls]) => cls !== charClass);
    }

    const leviMin = parseInt(document.getElementById("leviMin").value);
    const leviMax = parseInt(document.getElementById("leviMax").value);
    const leviOptions = Object.entries(allLeviathans)
      .filter(([_, c]) => c >= leviMin && c <= leviMax)
      .map(([lev]) => lev);
    chosenLeviathan = shuffleArray(leviOptions)[0];

    // Mutation logic
    const useMutation = document.getElementById("includeMutation")?.checked;
    if (useMutation) {
      const mutationOptions = Object.keys(baseLeviathans).filter(
        (lev) => lev !== chosenLeviathan
      );
      chosenMutation = shuffleArray(mutationOptions)[0];
    }

    // Save to localStorage
    const state = {
      includeDeepvale,
      playerCount,
      selectedPlayers,
      chosenLeviathan,
      chosenMutation,
      leviComplexity: { min: leviMin, max: leviMax }
    };
    localStorage.setItem("randomizerState", JSON.stringify(state));
  }

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = '';

  selectedPlayers.forEach((player, i) => {
    const complexity = allNames[player.charName];
    const classStats = allClasses[player.charClass];
    const div = document.createElement("div");
    div.className = "player";
    div.innerHTML = `
        <strong>Player ${i + 1}:</strong>
        ${player.charName} (${stars(complexity)})
        the ${player.charClass} (Mobility: ${classStats.mobility}, Power: ${classStats.power}, Support: ${classStats.support}, Complexity: ${stars(classStats.complexity)})
        `;
    resultsDiv.appendChild(div);
  });

  const leviathanDiv = document.createElement("div");
  leviathanDiv.className = "leviathan";
  leviathanDiv.innerHTML = `
        <strong>Leviathan Encounter:</strong> ${chosenLeviathan} (${stars(allLeviathans[chosenLeviathan])})
    `;
  resultsDiv.appendChild(leviathanDiv);

  // Output Mutation if enabled
  const useMutation = document.getElementById("includeMutation")?.checked;
  if (useMutation && chosenMutation) {
    const mutationDiv = document.createElement("div");
    mutationDiv.className = "leviathan";
    mutationDiv.innerHTML = `
      <strong>Mutation:</strong> ${chosenMutation}
    `;
    resultsDiv.appendChild(mutationDiv);
  }
}

function restorePreviousState() {
  const saved = localStorage.getItem("randomizerState");
  if (!saved) return;
  const state = JSON.parse(saved);

  document.getElementById("includeDeepvale").checked = state.includeDeepvale;
  document.getElementById("playerCount").value = state.playerCount;
  renderComplexityControls();

  document.getElementById("leviMin").value = state.leviComplexity.min;
  document.getElementById("leviMax").value = state.leviComplexity.max;

  assignCharacters(state);
}

// Initial setup
window.onload = () => {
  renderComplexityControls();
  restorePreviousState();
};
