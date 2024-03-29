let model
let videoWidth, videoHeight
let ctx, canvas
const log = document.querySelector("#array")
const VIDEO_WIDTH = 720
const VIDEO_HEIGHT = 405
let predictionsArray

// video fallback
navigator.getUserMedia = navigator.getUserMedia ||navigator.webkitGetUserMedia || navigator.mozGetUserMedia

// array posities van de vingerkootjes
let fingerLookupIndices = {
    thumb: [0, 1, 2, 3, 4],
    indexFinger: [0, 5, 6, 7, 8],
    middleFinger: [0, 9, 10, 11, 12],
    ringFinger: [0, 13, 14, 15, 16],
    pinky: [0, 17, 18, 19, 20]
}

//
// start de applicatie
//
async function main() {
    model = await handpose.load()
    const video = await setupCamera()
    video.play()
    startLandmarkDetection(video)
}

//
// start de webcam
//
async function setupCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
            "Webcam not available"
        )
    }

    const video = document.getElementById("video")
    // let poses = [];
    const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
            facingMode: "user",
            width: VIDEO_WIDTH,
            height: VIDEO_HEIGHT
        }
    })
    video.srcObject = stream

    // const poseNet = ml5.poseNet(video, modelLoaded)
    //
    // poseNet.on('pose', (results) => {
    //     poses = results
    //     console.log(poses)
    // })

    return new Promise(resolve => {
        video.onloadedmetadata = () => {
            resolve(video)
        }
    })
}

//
// predict de vinger posities in de video stream
//
async function startLandmarkDetection(video) {

    videoWidth = video.videoWidth
    videoHeight = video.videoHeight

    canvas = document.getElementById("output")

    canvas.width = videoWidth
    canvas.height = videoHeight

    ctx = canvas.getContext("2d")

    video.width = videoWidth
    video.height = videoHeight

    ctx.clearRect(0, 0, videoWidth, videoHeight)
    ctx.strokeStyle = "red"
    ctx.fillStyle = "red"

    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1) // video omdraaien omdat webcam in spiegelbeeld is

    predictLandmarks()
}

//
// predict de locatie van de vingers met het model
//
async function predictLandmarks() {
    ctx.drawImage(video,0,0,videoWidth,videoHeight,0,0,canvas.width,canvas.height)
    // prediction!
    const predictions = await model.estimateHands(video)
    if (predictions.length > 0) {
        const result = predictions[0].landmarks
        drawKeypoints(ctx, result, predictions[0].annotations)
        logData(predictions)
    }

    // 60 keer per seconde is veel, gebruik setTimeout om minder vaak te predicten
    requestAnimationFrame(predictLandmarks)

    // setTimeout(()=>predictLandmarks(), 1000)
}



const k = 3
const machine = new kNear(k)

let pinky = document.getElementById('pinky');

let highFive = document.getElementById('highfive');


function buttonAHandler(e){
    e.preventDefault();
    console.log('pinky')
    machine.learn(predictionsArray, 'pinky')
}

function buttonBHandler(e){
    e.preventDefault();
    console.log('high five')
    machine.learn(predictionsArray, 'highfive')
}



//
// toon de eerste 20 waarden in een log - elk punt heeft een X, Y, Z waarde
//
function logData(predictions) {
    pinky.addEventListener('click', (event) => buttonAHandler(event, predictions));
    highFive.addEventListener('click', (event) => buttonBHandler(event, predictions));

    predictionsArray = predictions[0].landmarks.reduce( (accumulator, currentValue) => {
        accumulator.push(currentValue[0]);
        accumulator.push(currentValue[1]);
        return accumulator;
    }, [] );

    // // predicting
    let prediction = machine.classify(predictionsArray)
    log.innerText = `I think it's a ${prediction}`;

    // let str = ""
    // console.log(predictions[0].landmarks)
    // for (let i = 0; i < 20; i++) {
    //     str += predictions[0].landmarks[i][0] + ", " + predictions[0].landmarks[i][1] + ", " + predictions[0].landmarks[i][2] + ", "
    // }
    //
    // // console.log(str);
    //
    // if(predictions[0].landmarks[20][1] < predictions[0].landmarks[16][1] && predictions[0].landmarks[12][1] && predictions[0].landmarks[12][1]){
    //     log.innerText = "Pinkie"
    // } else{
    //     log.innerText = "fhdjbewaslou"
    // }
}

//
// teken hand en vingers
//
function drawKeypoints(ctx, keypoints) {
    const keypointsArray = keypoints;

    for (let i = 0; i < keypointsArray.length; i++) {
        const y = keypointsArray[i][0]
        const x = keypointsArray[i][1]
        drawPoint(ctx, x - 2, y - 2, 3)
    }

    const fingers = Object.keys(fingerLookupIndices)
    for (let i = 0; i < fingers.length; i++) {
        const finger = fingers[i]
        const points = fingerLookupIndices[finger].map(idx => keypoints[idx])
        drawPath(ctx, points, false)
    }
}

//
// teken een punt
//
function drawPoint(ctx, y, x, r) {
    ctx.beginPath()
    ctx.arc(x, y, r, 0, 2 * Math.PI)
    ctx.fill()
}
//
// teken een lijn
//
function drawPath(ctx, points, closePath) {
    const region = new Path2D()
    region.moveTo(points[0][0], points[0][1])
    for (let i = 1; i < points.length; i++) {
        const point = points[i]
        region.lineTo(point[0], point[1])
    }

    if (closePath) {
        region.closePath()
    }
    ctx.stroke(region)
}

//
// start
//
main()