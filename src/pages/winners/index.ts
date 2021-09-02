import { carSvg } from "../../templates/car-svg";

class Winners {
  private container: HTMLElement;
  currentPage: number = 1;
  totalPages: number = 1;
  totalCars: number = 0;
  sortOrder: string = 'ASC';
  sort: string = 'id';

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'winners';
  }

  async getWinnersList() {
    let winnersInPage: any[] = [];
    let url = new URL('http://127.0.0.1:3000/winners/');
    url.searchParams.set('_order', this.sortOrder);
    url.searchParams.set('_sort', this.sort);
    try {
      let response = await fetch(url.toString(), {
        method: 'GET',
        headers: {},
      });
      if(response.ok) {
        let winners = await response.json();
        this.totalCars = winners.length;
        this.totalPages = Math.ceil(winners.length/10);
        for(let i = this.currentPage*10-10; i<=this.currentPage*10; i++) {
          if(winners[i-1]) {
            winnersInPage.push(winners[i-1]);
          }
        }
        return winnersInPage;
      } else return []    
    } catch (error) {
      return []
    }
  }

  async getCarInfoFromId(id: number) {
    let url = new URL('http://127.0.0.1:3000/garage/'+id.toString());
    url.searchParams.set('id', id.toString());
    let response = await fetch(url.toString(), {
      method: 'GET',
      headers: {}
    })
    if(response.ok) {
      return response.json()
    }
    return {}
  }

  addControlsButtons() {
    let controls = document.createElement('div');
    let pageUpButton = document.createElement('button');
    pageUpButton.innerText = '=>';
    pageUpButton.onclick = () => {
      if(this.currentPage===this.totalPages) {
        this.currentPage = 1;
      } else {
        this.currentPage++;
      }
      this.render();
    }
    let pageDownButton = document.createElement('button');
    pageDownButton.innerText = '<=';
    pageDownButton.onclick = () => {
      if(this.currentPage === 1) {
        this.currentPage = this.totalPages;
      }else {
        this.currentPage--;
      }
      this.render();
    }
    controls.append(pageDownButton, pageUpButton, `Page ${this.currentPage} of ${this.totalPages} (Total ${this.totalCars} cars)`);
    return controls;
  }

  addWinnersTable(winners: any[]) {
    let table = document.createElement('table');
    table.className = 'winners';
    let tableRowHeader = document.createElement('tr');
    let header1 = document.createElement('td');
    header1.innerText = '№';
    let header2 = document.createElement('td');
    header2.innerText = 'Image of the car';
    let header3 = document.createElement('td');
    header3.innerText = 'Name of the car"';
    let header4 = document.createElement('td');
    header4.innerText = 'Wins number';
    header4.onclick = () => {
      if(this.sortOrder==='ASC') {
        this.sortOrder = 'DESC';
      }else {
        this.sortOrder = 'ASC'
      }
      this.sort = 'wins';
      this.render();
    }
    let header5 = document.createElement('td');
    header5.innerText = 'Best time in seconds';
    header5.onclick = () => {
      if(this.sortOrder==='ASC') {
        this.sortOrder = 'DESC';
      }else {
        this.sortOrder = 'ASC'
      }
      this.sort = 'time';
      this.render();
    }
    tableRowHeader.append(header1, header2, header3, header4, header5);
    table.append(tableRowHeader);
    winners.forEach(async (winner, index) => {
      let carInfo = await this.getCarInfoFromId(winner.id);
      let cell1 = document.createElement('td');
      cell1.innerText = (index+1).toString();
      let cell2 = document.createElement('td');
      cell2.innerHTML = carSvg(carInfo.color);
      let cell3 = document.createElement('td');
      cell3.innerText = carInfo.name;
      let cell4 = document.createElement('td');
      cell4.innerText = winner.wins;
      let cell5 = document.createElement('td');
      cell5.innerText = winner.time.toString();
      let row = document.createElement('tr');
      row.append(cell1, cell2, cell3, cell4, cell5);
      table.append(row);
    })
    this.container.append(table);
  }

  async render() {
    this.container.innerText = '';
    this.addWinnersTable(await this.getWinnersList());
    this.container.append(this.addControlsButtons())
    return this.container;
  }
}

export default Winners