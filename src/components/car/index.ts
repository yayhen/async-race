import { carSvg } from "../../templates/car-svg";
import { flagSvg } from "../../templates/flag-svg";
import './style.css'

class Car {
  private container: HTMLElement;
  carInfo: {
    name: string,
    color: string,
    id: number,
  };
  velocity: number = 0;
  finished: boolean = false;
  private intervalId: NodeJS.Timer | undefined = undefined;

  constructor(name: string, color: string, id: number) {
    this.container = document.createElement('div');
    this.container.className = 'car-slot';
    this.container.id = id.toString();
    this.carInfo = {
      name,
      color,
      id,
    }
  }

  createCar() {
    let car = document.createElement('div');
    car.innerHTML = carSvg(this.carInfo.color);
    car.className = 'car-slot__car';
    car.id = 'car'+this.carInfo.id;
    car.style.left = '100px';
    this.container.append(car);
  }

  

  addFinishLine() {
    let finishLine = document.createElement('div');
    finishLine.className = 'car-slot__finish-line';
    finishLine.innerHTML = flagSvg();
    this.container.append(finishLine);
  }

  addSelectCarButton() {
    let selectCarButton = document.createElement('button');
    selectCarButton.className = 'car-slot__select-car';
    selectCarButton.innerText = 'Select';
    selectCarButton.onclick = () => {
      let textField = (document.getElementById('update-text-field') as HTMLInputElement);
      textField.value = this.carInfo.name;
      textField.setAttribute('car-id', this.carInfo.id.toString());
      let colorPicker = document.getElementById('car-color') as HTMLInputElement;
      colorPicker.value = this.carInfo.color;

    }
    this.container.append(selectCarButton);
  }

  addRemoveCarButton() {
    let removeCarButton = document.createElement('button');
    removeCarButton.className = 'car-slot__remove-car';
    removeCarButton.innerText = 'Remove';
    removeCarButton.onclick = () => {
      this.removeCar(this.carInfo.id);
    }
    this.container.append(removeCarButton);
  }

  async removeCar(id: number) {
    let request = await fetch('http://127.0.0.1:3000/garage/'+id, {
      method: 'DELETE',
      headers: {},
    });
    let carToDelete = document.getElementById(id.toString());
    carToDelete?.remove();

    let requestToWinners = await fetch('http://127.0.0.1:3000/winners/' + id, {
      method: 'DELETE',
      headers: {}
    })
  }

  addStartEngineButton() {
    let startEngineButton = document.createElement('button');
    startEngineButton.className = 'car-slot__start-engine';
    startEngineButton.innerText = 'A';
    startEngineButton.onclick = async () => {
      this.startEngine();
      startEngineButton.disabled = true;
      this.addStopEngineButton();
    }
    this.container.append(startEngineButton);
  }

  async startEngine() {
    let url = new URL('http://127.0.0.1:3000/engine/');
      url.searchParams.set('id', this.carInfo.id.toString());
      url.searchParams.set('status', 'started');
      let response = await fetch(url.toString(), {
        method: 'GET',
        headers: {},
      });
      let info = await response.json();
      this.velocity = info.velocity;
      this.startMovingCar(info.velocity);
  }

  async startMovingCar(velocity: number) {
    let car = document.getElementById('car'+this.carInfo.id);
    let intervalId = setInterval(() => {
      if(car) {
        let currentPosition = parseInt(car.style.left.slice(0, car.style.left.length-2));
        currentPosition += velocity/10;
        car.style.left =  `${currentPosition}px`;
        if(currentPosition >= this.container.clientWidth - 100) {
          this.finished = true;
          this.finishMovingCar(intervalId);
        }
      }
    }, 50);
    this.intervalId = intervalId;

    let url = new URL('http://127.0.0.1:3000/engine/');
    url.searchParams.set('id', this.carInfo.id.toString());
    url.searchParams.set('status', 'drive');
    try {
      let response = await fetch(url.toString(), {
        method: 'GET',
        headers: {},
      });
      if(response.status === 200) {

      }
      if(response.status === 500) {
        this.finishMovingCar(intervalId);
      }
    } catch (error) {
      alert('Error with engine response')
    }
  }

  finishMovingCar(timeoutId :NodeJS.Timer) {
    clearInterval(timeoutId);
  }

  addStopEngineButton() {
    let stopEngineButton = document.createElement('button');
    stopEngineButton.className = 'car-slot__stop-engine';
    stopEngineButton.innerText = 'B';
    stopEngineButton.onclick = () => {
      this.carMoveToStart();
      stopEngineButton.disabled = true;
      this.addStartEngineButton();
    };
    this.container.append(stopEngineButton);
  }

  async carMoveToStart() {
    let url = new URL('http://127.0.0.1:3000/engine/');
    url.searchParams.set('id', this.carInfo.id.toString());
    url.searchParams.set('status', 'stopped');
    let car = document.getElementById('car'+this.carInfo.id);
    let response = await fetch(url.toString(), {
      method: 'GET',
      headers: {}
    });
    if(response.ok) {
      if(car) {
        if(this.intervalId) {
          clearInterval(this.intervalId);
        }
        car.style.left = '100px';
      }
    }
  }

  addCarName() {
    let carName = document.createElement('p');
    carName.className = 'car-slot__car-name';
    carName.innerText = this.carInfo.name;
    this.container.append(carName);
  }

  render() {
    this.addSelectCarButton();
    this.addRemoveCarButton();
    this.addStartEngineButton();
    this.addStopEngineButton();
    this.createCar();
    this.addFinishLine();
    this.addCarName();
    return this.container;
  }
}

export default Car