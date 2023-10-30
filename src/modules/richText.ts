import snarkdown from "snarkdown";
const textboxId = "textbox";
async function terminateEvent(e: Event) {
	e.preventDefault();
	e.stopPropagation();
}
let preview = false;
document.addEventListener("DOMContentLoaded", () => {
	const textbox = document.getElementById(textboxId) as HTMLTextAreaElement;
	const previewButton = document.getElementById(
		"previewButton",
	) as HTMLButtonElement;
	const previewEl = document.getElementById("preview") as HTMLDivElement;
	const formattingActions: {
		button: HTMLButtonElement;
		onClick: (e: MouseEvent) => void;
	}[] = [
		// TODO: Refactor to support multiple textboxes on one page. Vanilla JS is hard :(
		{
			button: document.querySelector("#boldButton") as HTMLButtonElement,
			onClick: (e) => insertFormatting("**", "**", e),
		},
		{
			button: document.querySelector("#italicButton") as HTMLButtonElement,
			onClick: (e) => insertFormatting("*", "*", e),
		},
		{
			button: document.querySelector("#underlineButton") as HTMLButtonElement,
			onClick: (e) => insertFormatting("__", "__", e),
		},
		{
			button: document.querySelector(
				"#strikethroughButton",
			) as HTMLButtonElement,
			onClick: (e) => insertFormatting("~~", "~~", e),
		},
	];
	previewButton.addEventListener("click", () => {
		if (preview) {
			textbox.classList.remove("hidden");
			previewEl.classList.add("hidden");
			previewButton.innerText = "Preview";
		} else {
			previewEl.innerHTML = snarkdown(textbox.value);
			previewEl.style.height = `${textbox.offsetHeight}px`;
			textbox.classList.add("hidden");
			previewEl.classList.remove("hidden");
			previewButton.innerText = "Source";
		}
		preview = !preview;
	});
	formattingActions.forEach((action) => {
		action.button.addEventListener("click", action.onClick);
		action.button.addEventListener("mousedown", terminateEvent);
	});
	function insertFormatting(before = "", after = "", event: Event) {
		let value = textbox.value;
		let selectLoc;
		let selectEndLoc;
		if (textbox.selectionStart !== textbox.selectionEnd) {
			// text in textbox selected; wrap selection with formatting
			selectLoc = textbox.selectionStart + before.length;
			selectEndLoc = textbox.selectionEnd + before.length;
			value =
				value.slice(0, textbox.selectionStart) +
				before +
				value.slice(textbox.selectionStart, textbox.selectionEnd) +
				after +
				value.slice(textbox.selectionEnd, value.length);
		} else if (textbox.selectionStart === value.length) {
			// text in textbox not selected or selection at end; insert formatting at end
			value = value + before + after;
			selectLoc = value.length - after.length;
			textbox.focus();
		} else {
			// selection inside text but not highlighting anything; insert formatting around nearest word
			selectLoc = textbox.selectionStart + before.length;
			let i = 0;
			let done = false;
			value = value
				.split(" ")
				.map((val) => {
					if (done === true) return val;
					i += val.length;
					if (textbox.selectionStart < i) {
						// current word is selected
						done = true;
						return before + val + after;
					}
					return val;
				})
				.join(" ");
		}

		textbox.value = value;
		if (selectLoc) {
			textbox.setSelectionRange(selectLoc, selectEndLoc || selectLoc);
		}
	}
});
