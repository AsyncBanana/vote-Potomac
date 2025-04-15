import Plausible from "plausible-tracker";

const plausible = Plausible({
	domain: "votepotomac.com",
});
plausible.trackPageview();
