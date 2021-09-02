import Car from "../../components/car";
import ControlPanel from "../../components/control-panel";

class Garage {
  private container: HTMLElement;
  page: number;
  totalPages: number;
  cars: Car[] = [];
  totalCars: number = 0;

  constructor(page: number = 1) {
    this.container = document.createElement('div');
    this.container.className = 'garage';
    let controlPanel = new ControlPanel(this.cars, this);
    this.container.append(controlPanel.render());
    this.page = page;
    this.totalPages = 1;
  }

  async getCarsList(page: number) {
    this.page = page;
    this.container.innerText = '';
    try {
      let response = await fetch('http://127.0.0.1:3000/garage');
      if(response.ok) {
        let cars = await response.json();
        let carsCounter = 1;
        cars.forEach((element: { name: string; color: string; id: number; }) => {
          if(carsCounter>=(page-1)*7+1 && carsCounter<=(page)*7) {
            let car = new Car(element.name, element.color, element.id);
            this.cars.push(car);
            this.container.append(car.render());
          }
          carsCounter++;
        });
        this.totalCars = carsCounter - 1;
        let controlPanel = new ControlPanel(this.cars, this);
        this.container.prepend(controlPanel.render());
        this.totalPages = Math.ceil(carsCounter/7);
      }      
    } catch (error) {
      this.container.append('Connection error. Please try again')
    }
    this.container.append(this.addPageNavigation(), this.addPageDownButton(), this.addPageUpButton());
  }

  addPageNavigation() {
    let pageNavigation = document.createElement('p');
    pageNavigation.innerText = `Page ${this.page} of ${this.totalPages}. Total ${this.totalCars} cars`;
    return pageNavigation;
  }

  addPageUpButton() {
    let pageUpButton = document.createElement('button');
    pageUpButton.innerText = '=>';
    pageUpButton.onclick = () => {
      this.page++;
      if(this.page===this.totalPages+1) {
        this.page = 1;
      }
      this.getCarsList(this.page);
    }
    return pageUpButton;
  }

  addPageDownButton() {
    let pageDownButton = document.createElement('button');
    pageDownButton.innerText = '<=';
    pageDownButton.onclick = () => {
      this.page--;
      if(this.page===0) {
        this.page = this.totalPages;
      }
      this.getCarsList(this.page);
    }
    return pageDownButton;
  }

  render() {
    this.getCarsList(this.page);
    return this.container;
  }
}

export default Garage