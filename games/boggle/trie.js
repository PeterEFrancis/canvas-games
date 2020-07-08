
class Trie {

	constructor(name) {
		this.name = name;
		this.children = {};
		this.leaf = false;
	}

	push(string) {
		let name = string[0];
		if (!(name in this.children)) {
			this.children[name] = new Trie(name);
		}
		if (string.length > 1) {
			this.children[name].push(string.substring(1));
		} else {
			this.children[name].leaf = true;
		}
	}

	contains(string) {
		if (string.length == 1) {
			if (string in this.children) {
				if (this.children[string].leaf) {
					return 2;
				} else {
					return 1;
				}
			} else {
				return 0;
			}
		}

		if (string[0] in this.children) {
			return this.children[string[0]].contains(string.substring(1));
		} else {
			return 0;
		}
	}

	toString() {
		let s = "";
		if (this.leaf) {
			s += "_";
		}
		s += this.name + "";
		if (Object.keys(this.children).length > 0) {
			s += "[";
			for (let c in this.children) {
				s += this.children[c].toString();
				s += ","
			}
			s = s.substring(0, s.length - 1) + "]";
		}
		return s;
	}

}
