import Garage from "../garage";
import Winners from "../winners";
import './style.css';

class App {
  private container: HTMLElement;
  garage: Garage | undefined;
  
  constructor() {
    this.container = document.body;
    this.container.className = 'app';
  }

  addGarageButton() {
    let garageButton = document.createElement('button');
    garageButton.innerText = 'Garage';
    garageButton.onclick = () => {
      this.container.innerText = '';
      this.start(this.garage?.page);
    }
    return garageButton;
  }

  addWinnersButton() {
    let winnersButton = document.createElement('button');
    winnersButton.innerText = 'Winners';
    winnersButton.onclick = async () => {
      this.container.innerText = '';
      this.container.append(this.addGarageButton(), winnersButton);
      let winners = new Winners();
      this.container.append(await winners.render());
    }
    return winnersButton
  }

  start(page: number = 1) {
    this.container.append(this.addGarageButton(), this.addWinnersButton());
    let garage = new Garage(page);
    this.garage = garage;
    this.container.append(garage.render());
  }
}

export default App