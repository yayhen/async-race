import './style.css'

class ModalWinner {
  container: HTMLElement;
  constructor(message: string) {
    this.container = document.createElement('div');
    this.container.className = 'modal-winner';
    this.container.innerText = message;
    setTimeout(() => {
      this.container.style.display = 'none';
    }, 3000)
  }

  render() {
    return this.container;
  }
}

export default ModalWinner