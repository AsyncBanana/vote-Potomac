import Plausible from "plausible-tracker";

const plausible = Plausible({
	domain: "votepotomac.com",
	apiHost: "https://votepotomac.com",
});
plausible.trackPageview();
