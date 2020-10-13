const BAKHRA_CLASS = 'bakhra'
const BAGH_CLASS = 'bagh'


myImg = document.createElement("img")
myImg.src = 'static/img/bakhra.png'
myImg.id = BAKHRA_CLASS
imgPreload.appendChild(myImg)

myImg = document.createElement("img")
myImg.src = 'static/img/bagh.png'
myImg.id = BAGH_CLASS
imgPreload.appendChild(myImg)


var captured_bakhra = 0
var activated_bakhras = 0
var mid_game = false

var emptyCells = []
var baghCells = []
var bakhraCells = []

var iList
var jList
var position = 'B000B000000000000000B000B'
var positionHistory = []

const board = document.getElementById('board')
const cellElements = document.querySelectorAll('[data-cell]')

const winningMessageElement = document.getElementById('winningMessage')
const restartButton = document.getElementById('restartButton')
const winningMessageTextElement = document.querySelector('[data-winning-message-text]')
let baghTurn

restartButton.addEventListener('click', startGame)


function allDirectionCells([i, j]) {
    var returnList = []
    iList = [i - 1, i, i + 1]
    jList = [j - 1, j, j + 1]
    iList.forEach(ni => {
        jList.forEach(nj => {
            if (((i !== ni) || (j !== nj)) & nj < 6 & nj > 0 & ni < 6 & ni > 0) {
                returnList.push(ni * 10 + nj)
            }
        })
    })
    const index = returnList.indexOf(i * 10 + j)
    if (index > -1) {
        returnList.splice(index, 1);
    }

    return returnList
}

function straightDirectionCells([i, j]) {
    var returnList = []
    if (i + 1 < 6) {
        returnList.push((i + 1) * 10 + j)
    }
    if (j + 1 < 6) {
        returnList.push(i * 10 + j + 1)
    }
    if (i - 1 > 0) {
        returnList.push((i - 1) * 10 + j)
    }
    if (j - 1 > 0) {
        returnList.push(i * 10 + j - 1)
    }
    return returnList
}


function startGame() {
    document.getElementById('board').innerHTML = ''
    document.getElementById("message").innerHTML = ''
    emptyCells = []
    iList = [1, 2, 3, 4, 5]
    jList = [1, 2, 3, 4, 5]
    iList.forEach(ni => {
        jList.forEach(nj => {
            emptyCells.push(ni * 10 + nj)
            container = document.createElement("div")
            container.classList.add("cell")
            container.id = ni * 10 + nj
            container.setAttribute("onclick", "bakhraPlacing(this.id)")
            board.appendChild(container)

        })
    })
    baghCells = []
    bakhraCells = []
    captured_bakhra = 0
    activated_bakhras = 0

    baghTurn = false

    baghCells = [11, 15, 51, 55]
    baghCells.forEach(id => {
            myImg = document.createElement("img")
            myImg.src = 'static/img/bagh.png'
            myImg.id = 'bagh-' + id
            myImg.classList.add("bagh-image")

            container = document.getElementById(id)
            container.removeAttribute("onclick")
            container.appendChild(myImg)

            emptyCells.splice(emptyCells.indexOf(id), 1)
        })
        // Needs Review
    cellElements.forEach(cell => {
        cell.classList.remove(BAGH_CLASS)
        cell.classList.remove(BAKHRA_CLASS)
        cell.removeEventListener('click', handleMove) //
        cell.addEventListener('click', handleMove, { once: true }) //

        setBoardHoverClass() //



    })
    winningMessageElement.classList.remove('show')

}

startGame()

function setCharAt(str, index, chr) {
    if (index > str.length - 1) return str;
    return str.substring(0, index) + chr + str.substring(index + 1);
}

var captured_bakhra_counter
var indexReplace
var xMid
var yMid, possibleMoves, index, data


function dragBagh(event) {
    event.dataTransfer.setData("bagh-id", event.target.id);
}
var idBagh, movedImage, cell, bakhraImages



function dropBagh(event) {
    data = event.dataTransfer.getData("bagh-id")
    idBagh = parseInt(data.slice(-2))

    possibleMoves = possibleBaghMoves([Math.floor(idBagh / 10), idBagh % 10])
    index = possibleMoves.indexOf(parseInt(event.target.id))
    if (index > -1) {
        event.preventDefault()


        movedImage = document.getElementById(data)
        movedImage.id = 'bagh-' + event.target.id
        event.target.appendChild(movedImage)

        emptyCells.push(idBagh)
        emptyCells.splice(emptyCells.indexOf(parseInt(event.target.id)), 1)

        baghCells.splice(baghCells.indexOf(parseInt(idBagh)), 1)
        baghCells.push(parseInt(event.target.id))

        //has bagh jumped?
        if (possibleJumps.includes(parseInt(event.target.id))) {
            console.log("Bagh has jumped!")
            x1 = Math.floor(idBagh / 10)
            y1 = idBagh % 10

            x3 = Math.floor(parseInt(event.target.id) / 10)
            y3 = parseInt(event.target.id) % 10

            x2 = parseInt((x3 + x1) / 2)
            y2 = parseInt((y1 + y3) / 2)

            idB = parseInt(x2 * 10 + y2).toString()
            containerB = document.getElementById(idB)
            containerB.innerHTML = ''

            bakhraCells.splice(bakhraCells.indexOf(parseInt(x2 * 10 + y2)), 1)
            emptyCells.push(parseInt(x2 * 10 + y2))

            position = setCharAt(position, (Math.floor(idB / 10) - 1) * 5 + idB % 10 - 1, '0')

            captured_bakhra += 1

        }

        if (hasBaghWon()) {
            document.getElementById("winningMessage").classList.add("show")
            document.getElementById("message").innerHTML = "Bagh has won!"
        }

        emptyCells.forEach(id => {
            cell = document.getElementById(id.toString())
            cell.removeAttribute("ondrop")
            cell.removeAttribute("ondragover")
            if (activated_bakhras < 20) {
                cell.setAttribute("onclick", "bakhraPlacing(this.id)")
            } else {
                cell.setAttribute("ondrop", "dropBakhra(event)")
                cell.setAttribute("ondragover", "allowDrop(event)")
            }
        })

        baghImages = document.getElementsByClassName("bagh-image")
        Array.from(baghImages).forEach(img => {
            img.removeAttribute("draggable")
            img.removeAttribute("ondragstart")
        })

        if (activated_bakhras == 20) {
            bakhraImages = document.getElementsByClassName("bakhra-image")

            Array.from(bakhraImages).forEach(img => {
                img.setAttribute("draggable", "true")
                img.setAttribute("ondragstart", "dragBakhra(event)")
            })
        }

        position = setCharAt(position, (Math.floor(idBagh / 10) - 1) * 5 + idBagh % 10 - 1, '0')
        position = setCharAt(position, (Math.floor(event.target.id / 10) - 1) * 5 + event.target.id % 10 - 1, 'B')
        positionHistory.push(position)
    }
}

function dragBakhra(event) {
    event.dataTransfer.setData("bakhra-id", event.target.id)
}

var idBakhra, text

function dropBakhra(event) {
    data = event.dataTransfer.getData("bakhra-id")
    idBakhra = parseInt(data.slice(-2))

    possibleMoves = possibleBakhraMoves([Math.floor(idBakhra / 10), idBakhra % 10])
    index = possibleMoves.indexOf(parseInt(event.target.id))

    if (index > -1) {
        event.preventDefault()


        movedImage = document.getElementById(data)
        movedImage.id = 'bakhra-' + event.target.id
        event.target.appendChild(movedImage)

        emptyCells.push(idBakhra)
        emptyCells.splice(emptyCells.indexOf(parseInt(event.target.id)), 1)

        bakhraCells.splice(bakhraCells.indexOf(parseInt(idBakhra)), 1)
        bakhraCells.push(parseInt(event.target.id))

        if (hasBakhraWon()) {
            document.getElementById("winningMessage").classList.add("show")
            document.getElementById("message").innerHTML = "Bakhra has won!"
        }

        emptyCells.forEach(id => {
            cell = document.getElementById(id.toString())
            cell.removeAttribute("ondrop")
            cell.setAttribute("ondragover", "allowDrop(event)")
            cell.setAttribute("ondrop", "dropBagh(event)")

        })

        bakhraImages = document.getElementsByClassName("bakhra-image")
        Array.from(baghImages).forEach(img => {
            img.removeAttribute("draggable")
            img.removeAttribute("ondragstart")
        })

        baghImages = document.getElementsByClassName("bagh-image")
        Array.from(baghImages).forEach(img => {
            img.setAttribute("draggable", "true")
            img.setAttribute("ondragstart", "dragBagh(event)")
        })

        position = setCharAt(position, (Math.floor(idBakhra / 10) - 1) * 5 + idBakhra % 10 - 1, '0')
        position = setCharAt(position, (Math.floor(event.target.id / 10) - 1) * 5 + event.target.id % 10 - 1, 'b')
        positionHistory.push(position)
    }

}

function allowDrop(event) {
    event.preventDefault()
}

function bakhraPlacing(containerId) {
    //var containerId = ev.id
    myImg = document.createElement("img")
    myImg.src = 'static/img/bakhra.png'
    myImg.id = 'bakhra-' + containerId
    myImg.classList.add('bakhra-image')

    container = document.getElementById(containerId)
    container.appendChild(myImg)
    container.removeAttribute("onclick")

    bakhraCells.push(parseInt(containerId))
    emptyCells.splice(emptyCells.indexOf(parseInt(containerId)), 1)

    Array.from(document.getElementsByClassName("cell")).forEach(cell => {
        cell.removeAttribute("onclick")
    })
    baghImages = document.getElementsByClassName("bagh-image")
    Array.from(baghImages).forEach(img => {
        img.setAttribute("draggable", "true")
        img.setAttribute("ondragstart", "dragBagh(event)")
    })
    emptyCells.forEach(id => {
        cell = document.getElementById(id.toString())
        cell.setAttribute("ondrop", "dropBagh(event)")
        cell.setAttribute("ondragover", "allowDrop(event)")
    })

    if (hasBakhraWon()) {
        document.getElementById("winningMessage").classList.add("show")
        document.getElementById("message").innerHTML = "Bakhra has won!"
    }

    position = setCharAt(position, (Math.floor(containerId / 10) - 1) * 5 + containerId % 10 - 1, 'b')
    positionHistory.push(position)

    activated_bakhras += 1
    baghTurn = true
}

function setBoardHoverClass() {
    board.classList.remove(BAGH_CLASS)
    board.classList.remove(BAKHRA_CLASS)

    if (baghTurn) {
        board.classList.add(BAKHRA_CLASS)
    } else {
        board.classList.add(BAGH_CLASS)
    }
}

function isDraw() {
    positionHistory.length > 40 & positionHistory.indexOf(position) > -1 ? true : false

}


function placeMark(cellUI, currentClass) {
    cellUI.classList.add(currentClass)
}

function swapTurns() {
    baghTurn = !baghTurn
}

function possibleBakhraMoves([i, j]) {
    var possibleMoves = (i + j) % 2 == 0 ? allDirectionCells([i, j]) : straightDirectionCells([i, j])
    returnList = [...possibleMoves]
    possibleMoves.forEach(cell => {
        if (!emptyCells.includes(cell)) {
            returnList.splice(returnList.indexOf(cell), 1);
        }
    })
    return returnList
}

var possibleMoves, possibleJumps, returnList

function possibleBaghMoves([i, j]) {
    possibleMoves = (i + j) % 2 == 0 ? allDirectionCells([i, j]) : straightDirectionCells([i, j])
    possibleJumps = []
    possibleMoves.forEach(cell => {
        if (bakhraCells.includes(cell)) {

            var x2 = Math.floor(cell / 10)
            var y2 = cell % 10
            var x3 = x2 + x2 - i
            var y3 = y2 + y2 - j

            if (emptyCells.includes(x3 * 10 + y3)) {
                possibleJumps.push(x3 * 10 + y3)
            }
        }
    })
    possibleMoves = possibleMoves.concat(possibleJumps)
    returnList = [...possibleMoves]
    possibleMoves.forEach(cell => {
        if (!emptyCells.includes(cell)) {
            returnList.splice(returnList.indexOf(cell), 1);

        }


    })
    return returnList


}

function hasBaghWon() {
    return captured_bakhra == 5 ? true : false
}

function hasBakhraWon() {
    var possibleBaghMovesList = []
    baghCells.forEach(cell => {
        possibleBaghMovesList = possibleBaghMovesList.concat(possibleBaghMoves([Math.floor(cell / 10), cell % 10]))
    })
    return possibleBaghMovesList.length == 0 ? true : false
}