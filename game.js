// Create attack class for each attack move
class Attack {
  constructor(name, targets, weight, damage) {
    this.name = name;
    this.targets = targets;
    this.weight = weight;
    this.damage = damage;
  }
}

// Character class with basic properties and methods
class Character {
  constructor(name, hp, atk, def) {
    this.name = name;
    this.hp = hp;
    this.maxHp = hp;
    this.atk = atk;
    this.def = def;
    this.uses = { heal: 2, defend: 2 };
  }

  // Method to select an attack based on weights. It sums the weights of all attacks, generates a random number, and if the random number is less than the weight of an attack, that attack is selected, otherwise it continues to the next attack.
  selectAttack() {
    const totalWeight = this.attacks.reduce(
      (sum, attack) => sum + attack.weight,
      0,
    );
    let random = Math.random() * totalWeight;

    for (const attack of this.attacks) {
      if (random < attack.weight) {
        return attack;
      }
      random -= attack.weight;
    }
  }

  inflictDamage(attack, target) {
    let damageTaken = target.takeDamage(attack.damage);
    return damageTaken;
  }

  takeDamage(damage) {
    let damageTaken = Math.floor((damage * 100) / (100 + this.def));
    this.hp -= damageTaken;
    if (this.hp < 0) this.hp = 0;
    return damageTaken;
  }

  heal() {
    const amount = Math.min(Math.floor(this.maxHp * 0.5), this.maxHp - this.hp);
    this.hp += amount;
    this.uses.heal--;
    return amount;
  }
}

class Warrior extends Character {
  constructor(name, hp, atk, def) {
    super(name, hp, atk, def);
    this.attacks = [
      new Attack("Sword Slash", 1, 40, this.atk * 1),
      new Attack("Crushing Blow", 1, 30, this.atk * 1.33),
      new Attack("Shield Slam!", 1, 20, this.atk * 2),
      new Attack("Earthquake!!", 3, 10, this.atk * 3),
    ];
  }
}

class Archer extends Character {
  constructor(name, hp, atk, def) {
    super(name, hp, atk, def);
    this.attacks = [
      new Attack("Quick Shot", 1, 40, this.atk * 1),
      new Attack("Piercing Shot", 2, 30, this.atk * 1.33),
      new Attack("Sharp Aim!", 1, 20, this.atk * 2),
      new Attack("Arrow Rain!!", 3, 10, this.atk * 3),
    ];
  }
}

class Wizard extends Character {
  constructor(name, hp, atk, def) {
    super(name, hp, atk, def);
    this.attacks = [
      new Attack("Energy Bolt", 1, 40, this.atk * 1),
      new Attack("Meteor Storm", 3, 30, this.atk * 1.33),
      new Attack("Thunder Strike!", 1, 20, this.atk * 2),
      new Attack("Icy Blast!!", 2, 10, this.atk * 3),
    ];
  }
}

class Pirate extends Character {
  constructor(name, hp, atk, def) {
    super(name, hp, atk, def);
    this.attacks = [
      new Attack("Blade Swipe", 1, 40, this.atk * 1),
      new Attack("Cannon Barrage", 2, 30, this.atk * 1.33),
      new Attack("Hook Swing!", 1, 20, this.atk * 2),
      new Attack("Gunpowder Blast!!", 2, 10, this.atk * 3),
    ];
  }
}

// Add await time with an async IIFE function
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const warrior1 = new Warrior("Warrior", 130, 20, 15);
const wizard1 = new Wizard("Wizard", 80, 30, 4);
const archer1 = new Archer("Archer", 100, 24, 8);
const pirate1 = new Pirate("Pirate", 120, 22, 10);

let characters = [archer1, warrior1, wizard1, pirate1];

console.log("Character Stats: ");
for (let character of characters) {
  console.log(
    `CLS \x1b[36m${character.name}\x1b[0m | HP \x1b[31m${character.hp}\x1b[0m | ATK \x1b[33m${character.atk}\x1b[0m | DEF \x1b[34m${character.def}\x1b[0m`,
  );
}

console.log("\nDeciding turns:");

// Rolling the dice for initiative
const rollDie = () => Math.floor(Math.random() * 100) + 1;
function rollInitiative(characters) {
  const taken = new Set();

  for (const character of characters) {
    let dice = rollDie();

    while (taken.has(dice)) {
      console.log(
        `${character.name} rolled a ${dice}. Rerolling because it's already taken...`,
      );
      dice = rollDie();
    }

    taken.add(dice);
    character.diceRoll = dice;
    console.log(`${character.name} rolled a ${dice}.`);
  }
  return [...characters].sort((a, b) => b.diceRoll - a.diceRoll);
}
let queueCharacters = rollInitiative(characters);

// Print order
console.log("\nTurn Order:");
for (const index in queueCharacters) {
  console.log(`${parseInt(index) + 1}. ${queueCharacters[index].name}`);
}

// Condition for the game still running
let isBattleGoing = () => queueCharacters.length > 1;
let round = 1;

(async () => {
  // Start battle
  while (isBattleGoing()) {
    console.log(`\n\x1b[35m--- Round ${round} ---\x1b[0m`);

    for (const character of queueCharacters) {
      if (character.hp <= 0) continue; // skipping dead characters

      const hpRatio = character.hp / character.maxHp; // 1 = full HP, 0 = dead
      const healChance = hpRatio < 0.25 ? 0.4 : 0.05; // under 50% -> 40%, otherwise 5%

      const wantsToHeal =
        character.uses.heal > 0 && // has heals left
        character.hp < character.maxHp && // is actually hurt
        Math.random() < healChance;

      if (wantsToHeal) {
        const healed = character.heal();
        console.log(
          `\x1b[36m${character.name}\x1b[0m heals \x1b[32m${healed} HP\x1b[0m (${character.hp}/${character.maxHp}). Heals left: ${character.uses.heal}`,
        );
      } else {
        const attack = character.selectAttack();

        const targets = queueCharacters
          .filter((c) => c !== character)
          .sort(() => Math.random() - 0.5)
          .slice(0, attack.targets);

        for (const target of targets) {
          let inflictedDamage = character.inflictDamage(attack, target);

          const result =
            target.hp <= 0
              ? `\x1b[31m${target.name} has fallen.\x1b[0m`
              : `${target.name} has \x1b[32m${target.hp} HP\x1b[0m left.`;

          console.log(
            `\x1b[36m${character.name}\x1b[0m uses ${attack.weight === 10 ? `\x1b[35m${attack.name}\x1b[0m` : attack.name} dealing \x1b[33m${inflictedDamage} damage\x1b[0m to ${target.name}. ${result}`,
          );
        }
      }

      await sleep(1000);

      // Dead characters are removed permanently
      queueCharacters = queueCharacters.filter((c) => c.hp > 0);
    }

    round++;
  }

  if (queueCharacters.length === 1) {
    console.log(
      `\x1b[32m\n${queueCharacters[0].name} has won the battle!\x1b[0m`,
    );
  }
})();
