import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  apiKey = 'AIzaSyB7jQHmIh-3RCvyZeVBb1eeTn_8SQDjBrc';
  ytApiLink = 'https://www.yt-download.org/api/button/mp3/';
  htmlDoc: string;
  audioElement;
  playlist;
  playlistItem;
  videoList: Array<Song> = [];

  playlistUrl;
  model = 1;
  shuffleInput = false;

  loading = false;

  @ViewChild('audioOption') audioPlayerRef: ElementRef;

  constructor(private httpClient: HttpClient, private titleService: Title) {}

  ngOnInit(): void {
    this.titleService.setTitle('Youtube Playlist Manager');
  }

  getPlaylists() {
    this.httpClient
    .get('https://youtube.googleapis.com/youtube/v3/playlists?channelId=UCDO7t8l9uZe5jG09f5pzVLQ&key=' + this.apiKey)
    .subscribe(playlist => {
      this.playlist = playlist;
      this.getPlaylistItems();
    }, error => {
      console.log(error);
    });
  }

  getPlaylistItems() {
    if (this.playlistUrl === undefined || this.playlistUrl.search('list=') < 0) {
      alert('Please enter a valid youtube playlist url');
      return;
    }
    
    let url = 'https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet';
    url += '&playlistId=' + this.playlistUrl.substring(this.playlistUrl.search('list=') + 5);
    url += '&maxResults=30';
    url += '&key=' + this.apiKey;

    this.videoList = [];

    this.loading = true;
    this.httpClient.get(url).subscribe(playlistItem => {
      console.log(playlistItem);
      this.playlistItem = playlistItem;
      this.playlistItem.items.forEach(element => {
        let song: Song = new Song();
        song.title = element.snippet.title;
        song.videoId = element.snippet.resourceId.videoId;
        this.videoList.push(song);
      });

      if(this.shuffleInput){
        this.shuffle(this.videoList);
      }

      console.log(this.videoList);
      
      this.getMp3AndPlay(this.videoList[0]);
      this.audioPlayerRef.nativeElement.addEventListener('ended', (event) => {
        this.getNextSong();
      });
    });
  }

  getMp3AndPlay(data: Song) {
    this.titleService.setTitle(data.title);
    let newLink = this.ytApiLink + data.videoId;

    this.httpClient.get(newLink).subscribe(result => {
    }, error => {
      this.htmlDoc = error.error.text;
      let newString = this.htmlDoc.substring(this.htmlDoc.search('<a href='), this.htmlDoc.length);
      let newesetString = newString.substring(9, newString.length);
      let mp3 = newesetString.substring(0, newesetString.search(' ') - 1)

      if (this.model === 1) {
        this.audioElement = mp3;
      } else if (this.model === 2) {
        this.audioElement = mp3.replace('320', '256');    
      } else if (this.model === 3) {
        this.audioElement = mp3.replace('320', '192');    
      }
       else if (this.model === 4) {
        this.audioElement = mp3.replace('320', '128');    
      }
      console.log(this.audioElement);
      
      this.audioPlayerRef.nativeElement.src = this.audioElement;
      this.audioPlayerRef.nativeElement.play();
      this.loading = false;
      // this.audioPlayerRef.nativeElement.currentTime = 240;
      this.audioPlayerRef.nativeElement.playbackRate = 1; 
    });
  }

  getNextSong() {
    if (!this.audioElement) {
      alert('Please enter a valid youtube playlist url');
      return;
    }
    this.loading = true;
    this.videoList.splice(0, 1);
    this.getMp3AndPlay(this.videoList[0]);
  }

  shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }
}

class Song {
  title;
  videoId;
}
