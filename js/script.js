console.log('Hello');

let currsong = new Audio();
let songs;
let currFolder = "";

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();

    let div = document.createElement('div');
    div.innerHTML = response;
    let as = div.getElementsByTagName('a');


    songs = [];

    for (let i = 0; i < as.length; i++) {

        if (as[i].href.endsWith(".mp3")) {
            songs.push(as[i].href.split(`/${folder}/`)[1]);
        }

    }

    let songul = document.querySelector(".songlist").getElementsByTagName('ul')[0];
    songul.innerHTML = "";
    for (const song of songs) {

        songul.innerHTML += ` <li>
                            <img src="img/music.svg" alt="" style="filter: invert(1);">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                 
                            </div>
                            <div class="playnow">
                                <span>play now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div>
                        </li>`

    }

    //Attach eventlistener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName('li')).forEach(e => {
        e.addEventListener('click', () => {
            playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        }
        )
    })

    return songs;
}

const playmusic = ((track, pause = false) => {
    //let audio = new Audio("songs/"+track);
    currsong.src = `/${currFolder}/` + track;
    if (!pause) {

        currsong.play();
        play.src = "img/paused.svg";

    }
    document.querySelector(".songinfo").innerHTML = `<marquee behavior="" direction="">${decodeURI(track)}</marquee>`
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
});

async function diapalyAlbums() {

    let a = await fetch("/songs");
    let response = await a.text();

    let div = document.createElement('div');
    div.innerHTML = response;
    let anchor = div.getElementsByTagName('a');

    let cardscontainer = document.querySelector(".cardscontainer");
    let array = Array.from(anchor)

    for (let i = 0; i < array.length; i++) {
        const e = array[i];
        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0];

            // Get the metadata of the folder

            let b = await fetch(`/songs/${folder}/info.json`);
            let data = await b.json();
            console.log(data);


            cardscontainer.innerHTML = cardscontainer.innerHTML + ` <div class="cards" data-folder="${folder}">
                                                                        <div class="play">
                                                                            <img src="img/play.svg" alt="">
                                                                        </div>
                                                                        <img class="cimg" src="songs/${folder}/cover.jpg" alt="">
                                                                        <h2>${data.title}</h2>
                                                                        <p>${data.description}</p>
                                                                    </div>`
        }
    }

}
















async function main() {

    // Get the list of all songs    
    await getsongs("songs/cs");

    playmusic(songs[0], true);

    // Display all the albums on a page
    await diapalyAlbums();


    //Attach event listener to play , pause ,next and previous button

    let play = document.getElementById('play');
    let next = document.getElementById('next');
    let previous = document.getElementById('previous');

    play.addEventListener('click', () => {
        if (currsong.paused) {
            currsong.play();
            play.src = "img/paused.svg";

        } else {
            currsong.pause();
            play.src = "img/songplay.svg";
        }

    });

    //Event listener for timeupdate
    currsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currsong.currentTime)} / ${secondsToMinutesSeconds(currsong.duration)}`
        document.querySelector(".circle").style.left = (currsong.currentTime / currsong.duration) * 100 + "%";

    })

    // event listener for circle
    document.querySelector(".seekbar").addEventListener('click', (e) => {
        let persent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = persent + "%";
        currsong.currentTime = currsong.duration * persent / 100;
    })

    //Event listener for hamburger
    document.querySelector(".hamburger").addEventListener('click', () => {
        document.querySelector(".left").style.left = 0;
    });

    //Event listener for cross
    document.querySelector(".cross").addEventListener('click', () => {
        document.querySelector(".left").style.left = "-100%";
    });

    //Event listener for next
    next.addEventListener('click', () => {

        let index = songs.indexOf((currsong.src.split(`/${currFolder}/`)[1]));
        if ((index + 1) < songs.length) {

            playmusic(songs[index + 1])
        }

    })

    //Event listener for privious
    previous.addEventListener('click', () => {

        let index = songs.indexOf((currsong.src.split(`/${currFolder}/`)[1]));
        if ((index - 1) >= 0) {

            playmusic(songs[index - 1])
        }
    })

    //Event listener for volume
    document.querySelector(".volume").addEventListener('click', (e) => {
        if (currsong.muted == false) {
            currsong.muted = true;
            document.querySelector(".volume img").src = "img/mute.svg";
        }
        else {
            currsong.muted = false;
            document.querySelector(".volume img").src = "img/vol.svg";
        }
    });

    // Event listener whenever a card is clicked
    Array.from(document.getElementsByClassName("cards")).forEach(e => {
        e.addEventListener('click', async item => {
            console.log('fetching songs');
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
            playmusic(songs[0]);


        })
    })




}

main();
