console.log("Lets write Javascript")

let currentSong = new Audio()
let songs;
let currFolder
let vol = document.querySelector(".vol")


//function to set the volumeof the song by adjusting the volume bar
function volumeSet(){
    const volumeControl = document.getElementById('volumeControl');

    currentSong.volume = volumeControl.value / 100; // divide by 100 as volume takes value from 0 to 1

    volumeControl.addEventListener('input', function() {
        currentSong.volume = this.value / 100;
        if (currentSong.volume == 0) {
            vol.src = "img/mute.svg";
        }
        else{
            vol.src = "img/volume.svg"
        }
    });

    vol.addEventListener("click", ()=>{
        if(vol.src = "img/volume.svg"){
            vol.src = "img/mute.svg"
            currentSong.volume = 0;
            volumeControl.value = 0;
        }
    })

    
}


//converting secondds to minutes of the songTime
function convertSecondsToMinutes(seconds) {
    // Ensure the input is a number
    if (isNaN(seconds)) {
        return "00:00";
    }

    // Calculate the minutes and remaining seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    // Ensuring that seconds are always two digits
    const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;

    return `${minutes}:${formattedSeconds}`;
}


//fetch the songs from the folder of songs
async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    songs = []
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    //Play the first song 
    


    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = ""

    for (const song of songs) {
        let songName = song.replaceAll("%20", " ").split(" - ")[0]
        let songArtist = song.replaceAll("%20", " ").split(" - ")[1].split(".mp3")[0]
        songUL.innerHTML = songUL.innerHTML + `<li>
                                                    <div>
                                                        <img class="invert" src="img/music.svg" alt="">
                                                    </div>
                                                    <div class="songInfo">
                                                        <span class="songName">${songName}</span> |
                                                        <span class="songArtist">${songArtist}</span>
                                                    </div>
                                                    <button class="playNow">
                                                        <img class="invert playSong" src="img/play.svg" alt="">
                                                    </button>
                                                </li>`
    }


    //Attach an event listener whenever we click on play button of thwe given song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.querySelector(".playNow").addEventListener("click", ()=>{
            console.log(e.querySelector(".songName").innerHTML + " - " + e.querySelector(".songArtist").innerHTML + ".mp3");
            playMusic(e.querySelector(".songName").innerHTML + " - " + e.querySelector(".songArtist").innerHTML + ".mp3");
        })
    })

    return songs;

}

//play the music
const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track)

    currentSong.src = `${currFolder}/` + track;

    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }

    document.querySelector(".songDetails").innerHTML = decodeURI(track).split(".mp3")[0]
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}


//displaying the albums or the folders in the card container
async function displayAlbums(){
    let a = await fetch("http://127.0.0.1:5500/songs/");
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response
    // console.log(div)
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer")

    let ancArray = Array.from(anchors);
    for (let index = 0; index < ancArray.length; index++) {
        const element = ancArray[index];
        if(element.href.includes("/songs/")) {
            let folder = element.href.split("/songs/")[1]
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
            let response = await a.json();

            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card card1">
                                                                    <button data-folder="${folder}" class="play-button"><img src="img/playButton.svg" alt="PlayButton"></button>
                                                                    <img aria-hidden="false" draggable="false" loading="lazy"
                                                                        src="http://127.0.0.1:5500/songs/${folder}/cover.jpeg"
                                                                        data-testid="card-image" alt=""
                                                                        class= "pic mMx2LUixlnN_Fu45JpFB yMQTWVwLJ5bV8VGiaqU3 MxmW8QkHqHWtuhO589PV Yn2Ei5QZn19gria6LjZj">
                                                                    <h5>${response.title}</h5>
                                                                    <h6 class="translucent">${response.description}</h6>
                                                                </div>`

        }
    }

    //load the songs in the library whenever the card is clicked 
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener('click', async (item)=>{
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
        })
    })

    Array.from(document.getElementsByClassName("play-button")).forEach(button=>{
        button.addEventListener('click', async (e)=>{
            e.stopPropagation(); // Prevent the card's click event
            songs = await getSongs(`songs/${e.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        })
    })

        
}

async function main() {
    await getSongs("songs/rnd");
    
    playMusic(songs[0], true)

    //display all the albums on the container
    displayAlbums();

    play.addEventListener("click", ()=>{
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else{
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })
    
    currentSong.addEventListener("timeupdate", ()=>{
        // console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${convertSecondsToMinutes(currentSong.currentTime)} / ${convertSecondsToMinutes(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    document.querySelector(".seekbar").addEventListener("click", e =>{
        let percent = (e.offsetX/ e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent)/100;
    })

    document.querySelector(".hamburger").addEventListener("click", ()=>{
        document.querySelector(".left").classList.add("open");
    })
    document.querySelector(".close").addEventListener("click", ()=>{
        document.querySelector(".left").classList.remove("open")
    })

    let previous = document.querySelector(".previous");
    let next = document.querySelector(".next");

    previous.addEventListener("click", ()=>{
        let index = songs.indexOf(currentSong.src.split(`${currFolder}/`)[1]);
        if(index - 1 >= 0){
            playMusic(songs[index-1]);
        }
    })
    
    next.addEventListener("click", ()=>{
        let index = songs.indexOf(currentSong.src.split(`${currFolder}/`)[1]);
        if(index + 1 < songs.length){
            playMusic(songs[index+1]);
        }
    })

    //set the volume using the volume bar
    volumeSet();


    
}

main()