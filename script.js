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
            td.id=`spot_${i}_${j}`;
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
    const directions = Direct(item, num-1)
    const fix_y = (item.id).split("_")[1].value*1
    const fix_x = (item.id).split("_")[2].value*1

    if (directions.length != 0){
        if (item.style.backgroundColor =="green") {
            item.style.backgroundColor = ""
        }
        else{
            item.style.backgroundColor="green"
            for (let i = 0; i < directions.length; i++) {
                const act_y = directions[i][0]
                const act_x = directions[i][1]
                for (let index = 1; index < num; index++) {
                    let cur_y = fix_y
                    let cur_x = fix_x
                    if (act_y < fix_y) {
                        cur_y -= index
                    }
                    else if (act_y > fix_y) {
                        cur_y += index
                    }
                    if (act_x < fix_x) {
                        cur_x -= index
                    }
                    else if (act_x > fix_x) {
                        cur_x += index
                    }
                    const cur = document.getElementById(`spot_${cur_y}_${cur_x}`)
                    cur.style.backgroundColor = "red"
                    cur.addEventListener("click", function(){
                        Fixate()
                    })
                }
                let act = document.getElementById(`spot_${act_y}_${act_x}`)
                act.style.backgroundColor = "red"
                act.addEventListener("click", function(){
                    Fixate()
                })
            }
        }

    }

}

function Direct (item, num){
    const act_y = (item.id).split("_")[1].value*1
    const act_x = (item.id).split("_")[2].value*1
    let directions = []
    if (!(act_y + num > 10)) {
        directions.push[(act_y+num), act_x]
    }
    if (!(act_x + num > 10)) {
        directions.push[act_y, (act_x+num)]
    }
    if (!(act_y - num < 1)) {
        directions.push[(act_y-num), act_x]
    }
    if (!(act_x - num < 1)) {
        directions.push[act_y, (act_x-num)]
    }

    if (directions.length >= 1) {
        return directions
    }
    else {
        return []
    }
}
