window.addEventListener('load', function() {

    const select = document.querySelector("#SelectCommand")

    data.Commands.map((command, index) => {
        newOption = this.document.createElement("option");
        newOption.title = command.KorDescription;
        newOption.value = index;
        newOption.innerText = command.Name;

        select.appendChild(newOption);
    });

    this.document.querySelector(".ShowResult").addEventListener('click', Result);
});

function OnChangeCommand(){

    const descripttion = document.getElementById("Descript");
    const select = document.getElementById("SelectCommand");
    targetIndex = select.selectedIndex - 1;
    descripttion.innerText = data.Commands[targetIndex].KorDescription;
    ShowParameters(targetIndex, true);
    ShowParameters(targetIndex, false);
}

function GetValue(type, target){
    
    if(type == "String"){

        return `"${target.value}"`;
    }
    else if(type == "Float"){

        if(target.value == "")
            return "0f";

        return target.value + 'f';
    }
    else if(type == "Int"){

        if(target.value =="")
            return "0";
        return target.value.split(".")[0];
    }
    else if(type == "Bool")
        return target.checked;
    else if(type == "Vector2"){

        var x = target.childNodes[1].value;
        if(x == "") x ="0";
        var y = target.childNodes[3].value;
        if(y == "") y ="0";

        return `{${x}f, ${y}f}`;
    }
    else if(type == "Direction"){
        for(i = 0; i < 9; i++){
            if(i == 4)
                continue;

            if(target.childNodes[i].checked){
                var direction = [];
                if(i / 3 >= 2)
                    direction.push("D");
                if(i / 3 < 1)
                    direction.push("U");
                if(i % 3 == 0) 
                    direction.push("L");
                if(i % 3 == 2)
                    direction.push("R");

                return direction.join(" + ");
            }
        }
        return "U + L";
    }
}

function Result() {
    const select = document.querySelector("#SelectCommand");
    const target = document.querySelector(".result");

    index = select.selectedIndex - 1;
    if(index < 0) return;

    result = `${data.Commands[index].Name}(`;
    result += ReadData(true);
    result += ReadData(false);

    if(currentData.Essential.length + currentData.Sub.length > 0)
        result = result.slice(0, -2);
    result += ");";
    target.innerText = result;
}

function ReadData(isEssential){

    var serial = "Parameter";
    var result ="";
    
    if(isEssential)
        serial = "E" + serial;
    else 
        serial = "S" + serial;

    currentData = data.Commands[index];

    var selectedData;
    if(isEssential)
        selectedData = currentData.Essential;
    else 
        selectedData = currentData.Sub;

    for(var i = 0; i < selectedData.length; i++){

        parameterInfo = selectedData[i].Name;
        var type = selectedData[i].Type;
        var isList = type.endsWith("[]");
        type = type.replace("[]", "");

        if(isList) {

            group = document.querySelector(`#${serial}${i}`);
            parameterInfo += "[ "; 
            for(var j = 0; j < group.childNodes.length; j++){
                parameterInfo += `${GetValue(type, group.childNodes[j])}, `;
            }

            if(group.childNodes.length != 0)
                parameterInfo = parameterInfo.slice(0, -2);
            parameterInfo += " ] | ";
        }
        else {

            value = document.querySelector(`#${serial}${i}0`); 
            parameterInfo += ` = ${GetValue(type, value)} | `;
        }
        result += parameterInfo;

    }
    return result;
}

function ShowParameters(targetIndex, essential){
    type = "Sub";
    if(essential){
        type = "Essential";
    }

    const parameters = document.querySelector(`#${type}Parameters`);
    while(parameters.firstChild){
        parameters.removeChild(parameters.firstChild);
    }

    const name = document.createElement("legend");
    name.innerText = type;
    parameters.appendChild(name);

    if(essential){
        count = data.Commands[targetIndex].Essential.length;
        data.Commands[targetIndex].Essential
            .map((param, index) => parameters.appendChild(MakeParameter(param,true, index)));

        
    }
    else {
        count = data.Commands[targetIndex].Sub.length;
        data.Commands[targetIndex].Sub
            .map((param, index) => parameters.appendChild(MakeParameter(param,false, index)))
    }

    if(count == 0){
            const nothing = document.createElement("p");
            nothing.innerText = "없음";
            parameters.appendChild(nothing);
        }
}
function MakeParameter(parameter, essential, index){

    nameformat = (essential ? 'E':'S') + "Parameter" + String(index);

    const newParameter = document.createElement("div");

    const label = document.createElement("div");
    label.innerText = `${parameter.Name} (${parameter.Type})`;
    const descript = document.createElement("p");
    descript.innerText = parameter.KorDescript;

    const block = document.createElement("div");

    type = parameter.Type;
    isList = type.endsWith('[]'); 
    typeName = parameter.Type.replace("[]", "");

    inputBox = document.createElement("div");
    inputBox.id = nameformat;
    inputBox.className = "ParameterInputBox";

    
    block.appendChild(inputBox);
    
    if(isList) {

        addButton = document.createElement("button");
        addButton.innerText = "Add";
        addButton.id = nameformat+"|" + typeName;
        addButton.addEventListener('click', AddButton);

        eraseButton = document.createElement("button");
        eraseButton.innerText = "Erase";
        eraseButton.id = nameformat+"&" + typeName;
        eraseButton.addEventListener('click', EraseButton);

        block.appendChild(addButton);
        block.appendChild(eraseButton);
    }
    else {
        input = DynamicInput(typeName, nameformat);
        inputBox.appendChild(input);
    }

    input.style['margin'] = '6px';

    newParameter.appendChild(label);
    newParameter.appendChild(descript);
    newParameter.appendChild(block);

    return newParameter;
}
function AddButton(event) {
    
    infos = event.target.id.split("|");
    nameformat = infos[0];
    typeName = infos[1];

    target = document.querySelector(`#${nameformat}`);

    newInput = DynamicInput(typeName, nameformat, target.childElementCount);
    target.appendChild(newInput);
}
function EraseButton(event) {
    
    infos = event.target.id.split("&");
    nameformat = infos[0];
    typeName = infos[1];

    target = document.querySelector(`#${nameformat}`);

    target.removeChild(target.lastChild);
}
function DynamicInput(type, nameformat, index = 0){
    if(type == "Bool")
        input = BoolInput(nameformat, index);
    else if(type == "Float"|| typeName == "Int")
        input = NumberInput(nameformat, index); 
    else if(type == "String")
        input = StringInput(nameformat, index);
    else if(type == "Direction")
        input = DirectionInput(nameformat, index);
    else if(type == "Vector2")
        input = VectorInput(nameformat, index);

    return input;
}
function BoolInput(nameformat, index = 0){
    input = document.createElement("input");
    input.id = nameformat + String(index);
    input.type = "checkbox";

    return input;
}
function StringInput(nameformat, index = 0){
    input = document.createElement("input");
    input.type = "text";
    input.id = nameformat + String(index);

    return input;
}
function NumberInput(nameformat, index = 0){
    input = document.createElement("input");
    input.type = "number";
    input.id = nameformat + String(index);

    return input;
}
function VectorInput(nameformat, index = 0){
        xInput = document.createElement("input");
        xInput.id = nameformat;
        xInput.type = "number";
        xInput.className = "Vector";
        x = document.createElement("span");
        x.innerText = " X: ";
        
        yInput = document.createElement("input");
        yInput.id = nameformat;
        yInput.type = "number";
        yInput.className = "Vector";
        y = document.createElement("span");
        y.innerText = " Y: ";

        const input = document.createElement("div");
        input.id = `${nameformat}${index}`;
        input.appendChild(x);
        input.appendChild(xInput);
        input.appendChild(y);
        input.appendChild(yInput);

        return input;

}
function DirectionInput(nameformat, index = 0) {
    direction = document.createElement("div");
    direction.className = "Direction";
    direction.id = `${nameformat}${index}`;

    for(i = 0; i < 9; i++){
        button = document.createElement("input");
        button.type = "radio";
        //center button
        if(i == 4) {
            button.disabled = true;
            direction.appendChild(button);
            continue;
        }

        button.id = `${nameformat}${index}${i}`;
        button.name = nameformat + String(index);
        direction.appendChild(button);
    }

    return direction;
}

const data = {
    "Commands": [
        {
            "Name": "GeneratePerson",
            "EngDescription": "Make actor for tempolary space",
            "KorDescription": "임시공간에 쓰일 사람을 만듭니다.",
            "Essential":[
                {
                    "Name": "Code",
                    "Type": "Int",
                    "EngDescript": "Actor's serial code",
                    "KorDescript": "사람의 고유 번호" 
                }
            ], 
            "Sub":[
                {
                    "Name": "Pos",
                    "Type": "Vector2",
                    "EngDescript": "Generating Actor's position",
                    "KorDescript": "생성 위치"
                },
                {
                    "Name": "View",
                    "Type": "Direction",
                    "EngDescript": "Actor's default view direction",
                    "KorDescript": "플레이어가 보고 있는 방향"
                }
            ]
        },
        {
            "Name": "Move",
            "EngDescription": "It show tempolary actor's move",
            "KorDescription": "임시 플레이어의 움직임을 보입니다.",
            "Essential":[
                {
                    "Name": "Target",
                    "Type": "Int",
                    "EngDescript": "Select move target(Tempolary Actor's Code)",
                    "KorDescript": "움직일 대상(임시 플레이어의 코드)"
                },
                {
                    "Name": "Route",
                    "Type": "Direction[]",
                    "EngDescript": "Tempolary Actor's move route.",
                    "KorDescript": "임시 플레이어의 이동경로"
                } 
            ], 
            "Sub":[
                {
                    "Name": "Power",
                    "Type": "Float",
                    "EngDescript": "second per block",
                    "KorDescript": "한 블럭을 움직이는 데 걸리는 시간"
                },
                {
                    "Name": "Loop",
                    "Type": "Int",
                    "EngDescript": "How many reapt route",
                    "KorDescript": "경로를 반복할 횟수"
                },
                {
                    "Name": "Follow",
                    "Type": "Bool",
                    "EngDescript": "Whether the camera moves along with tempolary actor",
                    "KorDescript": "카메라가 임시 플레이어와 같이 움직이는 지 여부"
                }
            ]
        },
        {
            "Name": "GetItem",
            "EngDescription": "Get item on communication",
            "KorDescription": "대화 중 아이템 획득할 수 있습니다.",
            "Essential":[
                {
                    "Name": "Code",
                    "Type": "Int",
                    "EngDescript": "Target of getting item",
                    "KorDescript": "획득할 아이템(아이템 코드)" 
                }
            ], 
            "Sub":[
                {
                    "Name": "Count",
                    "Type": "Int",
                    "EngDescript": "How many item find",
                    "KorDescript": "발견할 아이템의 수"
                }
            ]
        },
        {
            "Name": "Zoom",
            "EngDescription": "Zoom screen",
            "KorDescription": "화면을 확대, 축소 시킵니다.",
            "Essential":[
                {
                    "Name": "Percent",
                    "Type": "Float",
                    "EngDescript": "Percent of absolute zoom",
                    "KorDescript": "절대적 크기의 줌 비율" 
                }
            ], 
            "Sub":[
                {
                    "Name": "Power",
                    "Type": "Float",
                    "EngDescript": "How long time used by zoom",
                    "KorDescript": "줌에 걸리는 시간"
                }
            ]
        }, 
        {
            "Name": "SetBackground",
            "EngDescription": "Set Background image",
            "KorDescription": "뒷 배경을 정한다.",
            "Essential":[
                {
                    "Name": "Image",
                    "Type": "String",
                    "EngDescript": "background's route",
                    "KorDescript": "절대적 크기의 줌 비율" 
                }
            ], 
            "Sub":[
                {
                    "Name": "FadeTime",
                    "Type": "Float",
                    "EngDescript": "How long time appear background(fade in)",
                    "KorDescript": "배경이 나오는 데 걸리는 시간(fade in)"
                },
                {
                    "Name": "Upper",
                    "Type": "Bool",
                    "EngDescript": "Check this object's upper background",
                    "KorDescript": "위에 배경을 설정"
                }
            ]
        },
        {
            "Name": "ControleBackground",
            "EngDescription": "Control Background image(move or zoom)",
            "KorDescription": "뒷 배경을 조종한다.(움직이거나 확대)",
            "Essential":[
                {
                    "Name": "Pos",
                    "Type": "Vector2",
                    "EngDescript": "background's position",
                    "KorDescript": "배경 위치" 
                },
                {
                    "Name": "Zoom",
                    "Type": "Float",
                    "EngDescript": "Percent of absolute zoom",
                    "KorDescript": "절대적 크기의 줌 비율"
                },
                {
                    "Name": "Power",
                    "Type": "Float",
                    "EngDescript": "How long time used by zoom",
                    "KorDescript": "줌에 걸리는 시간"                     
                }
            ], 
            "Sub":[]
        },
        {
            "Name": "ClearBackground",
            "EngDescription": "clear Background image",
            "KorDescription": "뒷 배경을 없앤다.",
            "Essential":[], 
            "Sub":[
                {
                    "Name": "Upper",
                    "Type": "Bool",
                    "EngDescript": "Clear target is upper background?",
                    "KorDescript": "위쪽 배경을 클리어 여부"                     
                }
            ]
        },
        {
            "Name": "SetMap",
            "EngDescription": "Set map on tempolary space",
            "KorDescription": "임시공간의 배경을 설정한다.",
            "Essential":[
                {
                    "Name": "MapCode",
                    "Type": "Int",
                    "EngDescript": "target map's code",
                    "KorDescript": "해당 맵의 코드"                     
                }
            ], 
            "Sub":[
                {
                    "Name": "Pos",
                    "Type": "Vector2",
                    "EngDescript": "map's position",
                    "KorDescript": "맵의 생성 위치"                     
                }
            ]
        },
        {
            "Name": "SetCameraPos",
            "EngDescription": "Set Camera's position on tempolary space",
            "KorDescription": "임시 공간 상에서의 카메라 위치를 정한다.",
            "Essential":[
                {
                    "Name": "Pos",
                    "Type": "Vector2",
                    "EngDescript": "camera's position",
                    "KorDescript": "카메라 위치 좌표"                     
                }
            ], 
            "Sub":[
                {
                    "Name": "Power",
                    "Type": "Float",
                    "EngDescript": "How long time to move completly",
                    "KorDescript": "카메라가 이동하는 데 걸리는 시간"                     
                }
            ]
        },
        {
            "Name": "MakeSelect",
            "EngDescription": "appear select window",
            "KorDescription": "선택창이 나온다.",
            "Essential":[
                {
                    "Name": "Factor",
                    "Type": "String[]",
                    "EngDescript": "select window's elements",
                    "KorDescript": "선택창의 선택지"                     
                }
                
            ], 
            "Sub":[
                {
                    "Name": "Title",
                    "Type": "String",
                    "EngDescript": "This select window's topic",
                    "KorDescript": "선택창의 주제 / 제목"                     
                }
            ]
        },
        {
            "Name": "Focus",
            "EngDescription": "Set Camera's position to whom exist on tempolary space position ",
            "KorDescription": "카메라의 위치를 임시 공간의 플레이어의 위치로 한다.",
            "Essential":[
                {
                    "Name": "Target",
                    "Type": "Int",
                    "EngDescript": "target tempolary actor",
                    "KorDescript": "임시 플레이어 코드"                     
                }
            ], 
            "Sub":[
                {
                    "Name": "Pos",
                    "Type": "Vector2",
                    "EngDescript": "Interval",
                    "KorDescript": "플레이어와 카메라의 차이"                     
                },
                {
                    "Name": "Power",
                    "Type": "Float",
                    "EngDescript": "How long time to move completly",
                    "KorDescript": "완전히 이동하기까지 걸리는 시간"                     
                }
            ]
        },
        {
            "Name": "SetPersonPos",
            "EngDescription": "Set tempolary actor's position",
            "KorDescription": "임시공간의 플레이어의 위치를 정한다.",
            "Essential":[
                {
                    "Name": "Target",
                    "Type": "Int",
                    "EngDescript": "target actor's code",
                    "KorDescript": "대상 플레이어의 코드"                     
                }
            ], 
            "Sub":[
                {
                    "Name": "Pos",
                    "Type": "Vector2",
                    "EngDescript": "result position",
                    "KorDescript": "움직일 위치"                     
                }
            ]
        },
        {
            "Name": "StartChangeEffect",
            "EngDescription": "Start scence change effect",
            "KorDescription": "화면 전환 효과를 시작합니다.",
            "Essential":[
                {
                    "Name": "Power",
                    "Type": "Float",
                    "EngDescript": "How long time to end effect completly",
                    "KorDescript": "이펙트가 끝날 때까지 걸리는 시간"                     
                }
            ], 
            "Sub":[
                {
                    "Name": "Roll",
                    "Type": "Bool",
                    "EngDescript": "Effect's type equal to roll type",
                    "KorDescript": "돌아가는 형태의 화면 전환"                     
                }
            ]
        },
        {
            "Name": "ClearEffect",
            "EngDescription": "Clear scence change effect",
            "KorDescription": "화면 전환 효과를 제거합니다.",
            "Essential":[
                {
                    "Name": "Power",
                    "Type": "Float",
                    "EngDescript": "How long time to disappear effect(fade out)",
                    "KorDescript": "화면 전환 효과가 사라지는 데 걸리는 시간(fade out)"                     
                }
            ], 
            "Sub":[]
        },
        {
            "Name": "Wait",
            "EngDescription": "Just wait some second",
            "KorDescription": "몇초 기다리기",
            "Essential":[
                {
                    "Name": "Power",
                    "Type": "Float",
                    "EngDescript": "How long wait",
                    "KorDescript": "기다릴 시간"                     
                }
            ], 
            "Sub":[]
        },
        {
            "Name": "SetChapter",
            "EngDescription": "Set Game's chapter",
            "KorDescription": "게임의 챕터를 바꿉니다.",
            "Essential":[
                {
                    "Name": "Code",
                    "Type": "Int",
                    "EngDescript": "Target Chapter",
                    "KorDescript": "이동할 챕터"                     
                }
            ], 
            "Sub":[]
        },
        {
            "Name": "AddRealPos",
            "EngDescription": "Move position on real space",
            "KorDescription": "현실 공간에서 좌표만큼 이동시킵니다.",
            "Essential":[
                {
                    "Name": "Pos",
                    "Type": "Vector2",
                    "EngDescript": "how many move",
                    "KorDescript": "움직일 양"                     
                },
                {
                    "Name": "Duraction",
                    "Type": "Float",
                    "EngDescript": "How long time to move completly",
                    "KorDescript": "움직이는 데 걸리는 시간"                     
                }
            ], 
            "Sub":[]
        },
        {
            "Name": "Tutorial",
            "EngDescription": "Show simple tutorial(No save, just one page)",
            "KorDescription": "단순한 튜토리얼을 재생합니다.(저장되지 않으며 한페이지 고정)",
            "Essential":[
                {
                    "Name": "Info",
                    "Type": "String",
                    "EngDescript": "tutorial's context",
                    "KorDescript": "튜토리얼 내용"                     
                }
            ], 
            "Sub":[
                {
                    "Name": "Title",
                    "Type": "String",
                    "EngDescript": "tutorial's name",
                    "KorDescript": "튜토리얼 제목"                     
                },
                {
                    "Name": "Image",
                    "Type": "String",
                    "EngDescript": "Show Image",
                    "KorDescript": "보여줄 이미지"                     
                }
            ]
        },
        {
            "Name": "ShowTutorial",
            "EngDescription": "Load Set of Tutorial",
            "KorDescription": "튜토리얼 집합을 불러옵니다.",
            "Essential":[
                {
                    "Name": "Code",
                    "Type": "Int",
                    "EngDescript": "Tutorial set code",
                    "KorDescript": "튜토리얼 집합 코드"                     
                }
            ], 
            "Sub":[]
        },
        {
            "Name": "MeetMonster",
            "EngDescription": "Meet Monster",
            "KorDescription": "적과 만납니다.",
            "Essential":[
                {
                    "Name": "Code",
                    "Type": "Int",
                    "EngDescript": "Meet monster code",
                    "KorDescript": "만날 몬스터 코드"                     
                }
            ], 
            "Sub":[]
        }
    ]
}