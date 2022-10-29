import { io } from 'socket.io-client';
import { fromEvent, Observable, tap } from 'rxjs';
import { readline } from './utils/utils';

export class StarWarsService {
  socket; // Issue with Socket typings
  search$: Observable<StarWarsQuery>;

  constructor() {
    this.socket = io('http://0.0.0.0:3000');
    this.search$ = fromEvent(this.socket, 'search');
  }

  initializeSearch = () => {
    this.socket.once('connect', () => {
      this.askUserInput();
      this.handleSearchResults();
    });

    this.socket.on('disconnect', (args) => {
      console.log('DISCONNECTED');
      console.log(args);
      this.disconnect();
    });

    this.socket.on('error', (err) => {
      console.log('ERROR');
      console.log(err);
    });
  };

  handleSearchResults = () => {
    let resultCount = 0;
    this.search$
      .pipe(
        tap((_) => {
          resultCount++;
        }),
      )
      .subscribe((response) => {
        if (response.resultCount > 0) {
          console.log(
            `(${resultCount}/${response.resultCount}) ${response.name} -> ${response.films}`,
          );
        } else {
          console.log(`ERROR -> ${response.error}`);
        }

        if (response.resultCount === resultCount) {
          resultCount = 0;
          this.askUserInput();
        }
      });
  };

  disconnect = () => {
    this.socket.disconnect();
    // Add in other dependencies or types that need to have their resources freed up.
  };

  askUserInput = () => {
    readline.question(
      'What Star Wars character do you want to search for? ',
      (char) => {
        console.log(`User entered: ${char}`);

        this.socket.emit('search', { query: char });
      },
    );
  };
}
