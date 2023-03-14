const video = document.getElementById("webcam");
const label = document.getElementById("label");

const labelOneBtn = document.querySelector("#labelOne");
const labelTwoBtn = document.querySelector("#labelTwo");
const labelThreeBtn = document.querySelector("#labelThree");
const trainbtn = document.querySelector("#train");

labelOneBtn.addEventListener("click", (event) => addImage(event));
labelTwoBtn.addEventListener("click", (event) => saveModel(event));

trainbtn.addEventListener("click", (event) => train(event));

if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
            video.srcObject = stream;
        })
        .catch((err) => {
            console.log("Something went wrong!");
        });
}

label.innerText = "Ready when you are!";

// Extract the already learned features from MobileNet
const featureExtractor = ml5.featureExtractor('MobileNet', {
    numLabels: 2
}, modelLoaded);

// When the model is loaded
function modelLoaded() {
    console.log('Model Loaded!');
}

// Create a new classifier using those features and with a video element
const classifier = featureExtractor.classification(video, videoReady);

// Triggers when the video is ready
function videoReady() {
    console.log('The video is ready!');
}




// Add a new image with a label
function addImage(e) {
    e.preventDefault()
    const label = document.getElementById('classname').value;

    console.log(label);
    classifier.addImage(video, label);
}

let ready = false;
// Retrain the network
function train(e){
    e.preventDefault()
    classifier.train((lossValue) => {
        console.log('Loss is', lossValue);
        ready = true;
    });
}


// Get a prediction for that image
setInterval( () => {
    if (ready) {
        classifier.classify(video, (err, result) => {
            console.log(result);
        })
    }
}, 1000)
;

function saveModel(e)
{
    e.preventDefault()
    featureExtractor.save()
};