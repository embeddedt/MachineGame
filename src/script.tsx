import './polyfills';
import Swal from 'sweetalert2';
import Level from './Level';
import runCompoundQuestions from './Compound';


var levelsToRun = [
    "bedroom",
    "lightbulb",
    "train_crossing",
    "repairshop"
];

function getParameterByName(name: string, url?: string): string | null {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

window.onload = async function() {
    if(getParameterByName("compound") != "true") {
        Swal.fire({
            title: 'Welcome!',
            text: "Your goal is to find all the simple machines in the scene by clicking on objects."
        });
        for(var currentLevel = 0; currentLevel < levelsToRun.length; currentLevel++) {
            var level = new Level(levelsToRun[currentLevel]);
            await level.run();
        }
        await Swal.fire({
            title: "Nice work!",
            text: "You answered all the questions!",
            icon: 'success'
        });
    } else {
        runCompoundQuestions();
    }
    
}