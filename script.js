function xyz() {
    var img = document.getElementById("halyo");
    img.src = "bum.png";
}
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
    const directions = Direct(item, num)

    if (directions.length != 0){
        if (item.style.backgroundColor =="green") {
            item.style.backgroundColor = ""
            for (let index = 0; index < directions.length; index++) {
                
            }
        }
        else{
            item.style.backgroundColor="green"
        }

    }

}

function Direct (item, num){
    const act_y = item.parentElement.getAttribute("class").value*1
    const act_x = item.getAttribute("class").value*1
    let directions = []
    if (!(act_y + num > 10)) {
        directions.push[act_x, (act_y+num)]
    }
    if (!(act_x + num > 10)) {
        directions.push[(act_x+num), act_y]
    }
    if (!(act_y - num < 1)) {
        directions.push[act_x, (act_y-num)]
    }
    if (!(act_x - num < 1)) {
        directions.push[(act_x-num), act_y]
    }

    if (directions.length >= 1) {
        return directions
    }
    else {
        return []
    }
}
