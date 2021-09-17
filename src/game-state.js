import { 
    RAIN_CHANCE, 
    SCENES, DAY_LENGTH, 
    NIGHT_LENGTH, 
    getNextHungerTime, 
    getNextDieTime, 
    getNextPoopTime } 
  from "./constants";
import { modScene, modFox, togglePoopBag, writeModal } from "./ui";


const gameState = {
  current: "INIT",
  clock: 1,
  wakeTime: -1, // -1 not curretly active
  sleepTime: -1,
  hungryTime: -1,
  dieTime: -1,
  timeToStartCelebrating: -1,
  timeToEndCelebrating: -1,
  poopTime: -1,
  
  tick() {
    this.clock++;
    console.log('clock', this.clock);

    switch (this.clock) {
      case this.wakeTime:
        this.wake();
        break;
      case this.sleepTime:
        this.sleep();
        break;
      case this.hungryTime:
        this.getHungry();
        break;
      case this.dieTime:
        this.die();
        break;  
      case this.timeToStartCelebrating:
        this.startCelebrating();
        break;  
      case this.timeToEndCelebrating:
        this.endCelebrating();
        break;          
      case this.poopTime:
        this.poop();
        break;      
    }

    return this.clock;
  },
  
  handleUserAction(icon) {
    if (["SLEEP", "FEEDING", "CELEBRATING", "HATCHING"].includes(this.current)) {
      // do nothing
      return;
    }      

    if (this.current === 'INIT' || this.current === 'DEAD') {
      this.startGame();
      return;
    }

    switch (icon) {
      case 'weather':
        this.changeWeather();
        break;
      case 'poop':
        this.cleanUpPoop();
        break;
      case 'fish':
        this.feed();
        break;      
    }
  },
  
  startGame() {    
    console.log(this.curent)
    writeModal();
    this.curent = 'HATCHING';
    this.wakeTime = this.clock + 3;

    modFox('egg');
    modScene('day');
  },
  
  wake() {
    this.current = "IDLING",
    this.wakeTime = -1;
    this.scene = Math.random() > RAIN_CHANCE ? 0 : 1;
    modScene(SCENES[this.scene]);
    this.sleepTime = this.clock + DAY_LENGTH;
    this.hungryTime = getNextHungerTime(this.clock);
    this.determineFoxState();
  },

  sleep() {
    this.state = 'SLEEP';
    modFox('sleep');
    modScene('night');
    this.clearTimes();
    this.wakeTime = this.clock + NIGHT_LENGTH;
  },

  clearTimes() {
    this.wakeTime = -1;
    this.sleepTime = -1;
    this.hungryTime = -1;
    this.dieTime = -1;
    this.poopTime = -1;
    this.timeToStartCelebrating = -1;
    this.timeToEndCelebrating = -1;
  },

  getHungry() {
    this.current = 'HUNGRY';
    this.dieTime = getNextDieTime(this.clock);
    this.hungryTime = -1;
    modFox('hungry');
  },

  die() {
    this.current = "DEAD";
    modScene("dead");
    modFox("dead");
    this.clearTimes();
    writeModal("The fox died :( <br/> Press the middle button to start");
  },

  poop() {
    this.current = 'POOPING';
    this.poopTime = -1;
    this.dieTime = getNextDieTime(this.clock);
    modFox('pooping');
  },

  startCelebrating() {
    this.current = 'CELEBRATING';
    modFox('celebrate');
    this.timeToStartCelebrating = -1;
    this.timeToEndCelebrating = this.clock + 2;
  },

  endCelebrating() {
    this.timeToEndCelebrating = -1;
    this.current = 'IDLING';
    this.determineFoxState();
    togglePoopBag(false);
  },

  determineFoxState() {
    if (this.current === 'IDLING') {
      if (SCENES[this.scene] === 'rain') {
        modFox('rain');
      } else {
        modFox('idling');
      }
    }
  },

  changeWeather() {
    this.scene = (1 + this.scene) % SCENES.length;
    modScene(SCENES[this.scene]);
    this.determineFoxState();
  },

  cleanUpPoop() {
    if (this.current !== 'POOPING') {
      return;
    }

    this.dieTime = -1;
    togglePoopBag(true);
    this.startCelebrating();
    this.hungryTime = getNextHungerTime(this.clock);
  },

  feed() {
    if (this.current !== 'HUNGRY'){
      return;
    }

    this.current = 'FEEDING';
    this.dieTime = -1;
    this.poopTime = getNextPoopTime(this.clock);
    modFox('eating');
    this.timeToStartCelebrating = this.clock + 2;
  }
};

export const handleUserAction = gameState.handleUserAction.bind(gameState);
export default gameState;