export function compareArrays(a1: string[]|number[], a2: string[]|number[]){
    if(a1.length != a2.length) return false
    for(let i = 0; i < a1.length; i += 1){
        if(a1[i] != a2[i]){
            return false
        }
    }
    return true
}
