import Garage from "../../pages/garage";
import Car from "../car";
import ModalWinner from "../modal-window-winner";

class ControlPanel {
  private container: HTMLElement;
  cars: Car[];
  garage: Garage;

  constructor (cars: Car[], garage: Garage) {
    this.container = document.createElement('div');
    this.container.className = 'control-panel';
    this.container.style.margin = '25px';
    this.cars = cars;
    this.garage = garage;
  }

  addCreatePanel() {
    let createContainer = document.createElement('div');
    createContainer.className = 'control-panel__create-bar';

    let textField = document.createElement('input');
    textField.className = 'create-bar__input';
    textField.value = '';

    let colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.name = 'car-color';
    colorPicker.value = "#f6b73c";

    let createButton = document.createElement('button');
    createButton.className = 'create-bar__button';
    createButton.innerText = 'Create';
    createButton.onclick = () => {
      let name = textField.value;
      let color = colorPicker.value;
      if(name.length>=1) {
        this.createNewCar({name, color});
      } else alert('Please, enter car name')
    }

    createContainer.append(textField, colorPicker, createButton);
    this.container.append(createContainer);
  }

  async createNewCar(data: {name: string, color: string}) {
    let request = await fetch('http://127.0.0.1:3000/garage', {
      method: 'POST',
      headers: {'Content-Type': 'application/json',},
      body: JSON.stringify(data)
    });
    let result = await request.json();
    let newCar = new Car(result.name, result.color, result.id);
    let carsContainer = document.getElementsByClassName('container');
    carsContainer[0].append(newCar.render());
  }

  addUpdatePanel() {
    let updateContainer = document.createElement('div');
    updateContainer.className = 'control-panel__update-bar';

    let textField = document.createElement('input');
    textField.className = 'update-bar__input';
    textField.value = '';
    textField.id = 'update-text-field';

    let colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.id = 'car-color';
    colorPicker.name = 'car-color';
    colorPicker.value = "#f6b73c";

    let updateButton = document.createElement('button');
    updateButton.className = 'update-bar__button';
    updateButton.innerText = 'Update';
    updateButton.onclick = async () => {
      let url = new URL('http://127.0.0.1:3000/garage/'+ textField.getAttribute('car-id') || '');
      url.searchParams.set('id', textField.getAttribute('car-id') || '');
      let request = await fetch(url.toString(), {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          name: textField.value,
          color: colorPicker.value
        })
      })
    }

    updateContainer.append(textField, colorPicker, updateButton);
    this.container.append(updateContainer);
  }

  addRaceButton() {
    let raceButton = document.createElement('button');
    raceButton.className = 'control-panel__race';
    raceButton.innerText = 'Race';
    raceButton.onclick = () => {
      let timer = 0;
      this.cars.forEach((car) => {
        car.finished = false;
      });
      this.cars.forEach((car) => {
        car.startEngine();
      });
      let checkWinnerIntervalId = setInterval(() => {
        this.cars.forEach((car) => {
          if(car.finished) {
            clearInterval(checkWinnerIntervalId);
            this.newRecord(car.carInfo.id.toString(), timer/1000);
            let modalWinner = new ModalWinner(`Winner: ${car.carInfo.name} Time:${timer/1000}`);
            this.container.append(modalWinner.render());
          }
        })
        timer += 50;
      }, 50);
    }
    this.container.append(raceButton);
  }

  async newRecord(id: string, time: number) {
    let url = new URL('http://127.0.0.1:3000/winners/'+ id);
    url.searchParams.set('id', id.toString());
    let response = await fetch(url.toString(), {
      method: 'GET',
      headers: {}
    })
    if(response.ok) {
      let record = await response.json();
      let url = new URL('http://127.0.0.1:3000/winners/'+ id);
      url.searchParams.set('id', id.toString());
      let winsIncrement = record.wins;
      winsIncrement++;
      let newTime: number;
      if(record.time>=time) {
        newTime = time;
      }else {
        newTime = record.time;
      }
      let responseSecond = await fetch(url.toString(), {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          wins: winsIncrement,
          time: newTime
        })
      })
    } else {
      let url = new URL('http://127.0.0.1:3000/winners/');
      let responseSecond = await fetch(url.toString(), {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          id: id,
          wins: 1,
          time: time
        })
      })
    }
  }

  addResetButton() {
    let resetButton = document.createElement('button');
    resetButton.className = 'control-panel__reset';
    resetButton.style.display = 'inline-block';
    resetButton.innerText = 'Reset';
    resetButton.onclick = () => {
      this.cars.forEach((item) => {
        item.carMoveToStart();
      })
    }
    this.container.append(resetButton);
  }

  addGanerateHundredCars() {
    const carsNames = ['Lada',
                      'Volga',
                      'Honda',
                      'Ferrari',
                      'Bentley',
                      'Lamborgini',
                      'Infifity',
                      'Alpine',
                      'McLaren',
                      'Nissan'];

    const carsModels = ['Priora',
                      'Premium',
                      'Civic',
                      'Evolution',
                      'Db9',
                      'Focus',
                      'Benz',
                      'Clio',
                      '911',
                      'F1'];
    let generateButton = document.createElement('button');
    generateButton.className = 'control-panel__hundred-cars';
    generateButton.style.display = 'inline-block';
    generateButton.innerText = 'Generate cars';
    generateButton.onclick = () => {
      for(let i=1; i<=100; i++) {
        this.createNewCar({name: carsNames[Math.floor(Math.random()*carsNames.length)] + ' ' + carsModels[Math.floor(Math.random()*carsModels.length)],
          color: this.randomColor()})
      }
      this.garage.render();
    }
    this.container.append(generateButton);
  }

  randomColor(): string {
    let red1 = Math.floor(Math.random()*15).toString(16);
    let green1 = Math.floor(Math.random()*15).toString(16);
    let blue1 = Math.floor(Math.random()*15).toString(16);
    let red2 = Math.floor(Math.random()*15).toString(16);
    let green2 = Math.floor(Math.random()*15).toString(16);
    let blue2 = Math.floor(Math.random()*15).toString(16);

    return `#${red1+red2+green1+green2+blue1+blue2}`;
  }

  render() {
    this.addCreatePanel();
    this.addUpdatePanel();
    this.addRaceButton();
    this.addResetButton();
    this.addGanerateHundredCars();
    return this.container;
  }
}

export default ControlPanel