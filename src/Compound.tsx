
import Swal from 'sweetalert2';
import { machineInputOptions } from './machines';

interface CompoundQuestion {
    itemName: string;
    question: string;
    machineType: keyof typeof machineInputOptions;
    explanation?: string;
}

const compoundQuestions: CompoundQuestion[] = [
    { itemName: "axe.svg", question: "What type of simple machine is the handle of an axe?", machineType: "lever" },
    { itemName: "axe.svg", question: "What type of simple machine is the blade of an axe?", machineType: "wedge" },
    { itemName: "blinds.svg", question: "What type of simple machine is the cord on a set of blinds?", machineType: "pulley" },
    { itemName: "blinds.svg", question: "What type of simple machine is the pole you twist to open the blinds?", machineType: "gears", explanation: "Inside the blinds, a set of gears translate your movement of the pole to strings which open or close the blinds." },
    { itemName: "scissors.svg", question: "What type of simple machine are the handles on scissors?", machineType: "lever" },
    { itemName: "scissors.svg", question: "What type of simple machine are the blades of scissors?", machineType: "wedge" },
    { itemName: "seesaw.svg", question: "How about a seesaw?", machineType: "lever", explanation: "See how prevalent levers are?"},
    { itemName: "stapler.svg", question: "What type of simple machine is a staple?", machineType: "wedge", explanation: "Staples split through paper fibers in order to hold several pieces of paper together." },
    { itemName: "stapler.svg", question: "What type of simple machine is the stapler?", machineType: "lever", explanation: "Using a stapler makes it easier and safer to insert a staple." },
    { itemName: "highway.jpg", question: "What type of simple machine is a highway ramp?", machineType: "inclined_plane" },
];
export default async function runCompoundQuestions(): Promise<void> {
    document.documentElement.classList.add("compound-machine-bk");
    for(const q of compoundQuestions) {
        let numTries = 0;
        var existingAnswers = [];
        await Swal.fire({
            allowEscapeKey: false,
            allowEnterKey: false,
            allowOutsideClick: false,
            showCancelButton: false,
            text: q.question,
            imageUrl: `sprites/${q.itemName}`,
            input: 'select',
            inputOptions: machineInputOptions,
            inputPlaceholder: 'Select a machine',
            inputValidator: (value) => {
                return new Promise((resolve) => {
                    if(value == "")
                        resolve("You need to choose a machine.");
                    else if (value === q.machineType) {
                        resolve()
                    } else {
                        if(existingAnswers.indexOf(value) == -1) {
                            numTries++;
                            existingAnswers.push(value);
                        }
                        if(numTries < 3)
                            resolve('Try again!');
                        else
                            resolve('The correct answer is "' + machineInputOptions[q.machineType] + '".');
                    }
                })
            }
        });
        await new Promise(resolve => setTimeout(resolve, 1000));
        await Swal.fire({
            title: "That's right!",
            text: q.explanation,
            icon: 'success'
        });
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    await Swal.fire({
        title: "Nice work!",
        text: "You answered all the questions!",
        icon: 'success'
    });
}