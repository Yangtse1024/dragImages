/**
 * @author:  lanshuai
 * @Date: 2020-08-05
 * @description
 */


function defineReact(target, key, value, setHandle, deep){
    if(deep){
        observe(value);
    }
    Object.defineProperty(target, key, {
        set(v) {
            // debugger;
            // console.log('set ', key, v);
            value = v;
            setHandle();
        },
        get() {
            // console.log('get ', key);
            return value;
        }
    })
}

function observe(target, setHandle, deep = true) {
    console.log(target);
    // debugger;
    if(typeof target !== 'object' || target == null) {
        return;
    }
    for(let key in target){
        defineReact(target, key, target[key], setHandle, deep);
    }
}

function updateView(){
    console.log('updateView');
}
// const data = {
//     name: "zhangsan",
//     age: 20,
//     male: true,
//     info: {
//         address: "XXXXX"
//     }
// };
// observe(data, updateView, false);

// data.name = 'lisi';
// console.log(data.name);
// data.age = 30;
// console.log(data.age);
// data.info.address = "YYYYY";
// console.log(data.info.address);
// data.male = false;
// console.log(data.male);


export default observe;


