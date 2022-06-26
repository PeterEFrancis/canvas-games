
class Trie {

	constructor(n) {
		this.n = n; // name
		this.c = {}; // children
		this.l = false; // is leaf
	}

	push(string) {
		let n = string[0];
		if (!(n in this.c)) {
			this.c[n] = new Trie(n);
		}
		if (string.length > 1) {
			this.c[n].push(string.substring(1));
		} else {
			this.c[n].l = true;
		}
	}

	contains(string) {
		if (string.length == 1) {
			if (string in this.c) {
				if (this.c[string].l) {
					return 2;
				} else {
					return 1;
				}
			} else {
				return 0;
			}
		}

		if (string[0] in this.c) {
			return this.c[string[0]].contains(string.substring(1));
		} else {
			return 0;
		}
	}

	display() {
		let s = "";
		if (this.l) {
			s += "_";
		}
		s += this.n + "";
		if (Object.keys(this.c).length > 0) {
			s += "[";
			for (let c in this.c) {
				s += this.c[c].display();
				s += ","
			}
			s = s.substring(0, s.length - 1) + "]";
		}
		return s;
	}

	toString() {
		return JSON.stringify(this);
	}


}
