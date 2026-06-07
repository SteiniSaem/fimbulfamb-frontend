<script lang='ts'>

    let {/*option1, option2,*/ value = $bindable(), disabled = $bindable(), onChange} : {/*option1:string, option2:string,*/ value:boolean, disabled?: boolean, onChange:Function} = $props(); //width er til að hafa fast width því annars stækkar það þegar maður togglar því valda optionið verður bold og því breiðara og það stækkar þá líka containerinn sem toggleswitchinn er í


    function click(){
		if(disabled) return
		value = !value;
		onChange()
    }
</script>

<div class='flex select-none items-center'>
    <!--<p class={`mr-3 w-10 ${option1 == value ? 'font-semibold': ''}`}>{option1}</p>-->
    <label class="switch">
        <input type="checkbox" checked={value == false}  onclick={click}/>
        <span class={`slider transition duration-200 ${value ? 'bg-indigo-400' : 'bg-slate-300'}`}></span>
    </label>
    <!--<p class={`ml-2 w-10 ${option2 == value ? 'font-semibold': ''}`}>{option2}</p>-->
</div>
  
  <style>
    .switch {
      position: relative;
      display: inline-block;
      width: 46px;
      height: 26px;
    }
  
    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }
  
    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      -webkit-transition: 0.2;
      transition: 0.2;
      border-radius: 34px;
    }
  
    .slider:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      -webkit-transition: 0.4s;
      transition: 0.2s;
      border-radius: 50%;
    }
  
  
    input:checked + .slider:before {
      transform: translateX(20px);
    }
  </style>