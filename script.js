function xyz() {
    var img = document.getElementById("halyo");
    img.src = "bum.png";
}
const socket = io()
const own = document.getElementById("own_board")
const enemy = document.getElementById("enemy_board")
const table = document.createElement("table") 

function Create(){
    for (let i = 0; i < 10; i++) {
        const tr = document.createElement("tr")
        tr.classList.add(`${i+1}`)
        for (let j = 0; j < 10; j++) {
            const td = document.createElement("td")
            td.classList.add(`${j+1}`)
            td.addEventListener("click", function(){
                socket.emit('clicked', this)
                Change(this)
            })
            tr.appendChild(td)
        }
        table.appendChild(tr)
    }
    own.appendChild(table)
    enemy.appendChild(table)
}

function Change(item){
    let num = 5
    let act_p = num + item.getAtribute('class').value*1
    let act_m = item.getAtribute('class').value*1 - num

    // if (act_p > ) {
        
    // }
    if (item.style.backgroundColor =="green") {
        item.style.backgroundColor = ""
    }
    else{
        item.style.backgroundColor="green"
    }
}
