//Globals
var fetal;
var maternal;
var janus;

counts = [];
var gsetone;
var gsettwo;

var fetalM;
var maternalM;

//for(i=0; i<256; i++){
//	counts[i]=0;
//}

//why does this function not work within gish?

Object.prototype.clone = function() { // http://my.opera.com/GreyWyvern/blog/show.dml/1725165 
  		var newObj = (this instanceof Array) ? [] : {};
  		for (i in this) {
    		if (i == 'clone') continue;
    		if (this[i] && typeof this[i] == "object") {
      		newObj[i] = this[i].clone();
    		} else newObj[i] = this[i]
  		} return newObj;
	},

gish = {

//Two-Pass Algorithm

	zeros:function(dimensions){ //http://stackoverflow.com/questions/3689903/how-to-create-a-2d-array-of-zeroes-in-javascript
    	var array = [];
    	for (var i = 0; i < dimensions[0]; ++i) {
        	array.push(dimensions.length == 1 ? 0 : gish.zeros(dimensions.slice(1)));
    		}
    	return array;
	},

/*
	twoPass:function(M){
		var NextLabel = 1;
		var labels = gish.zeros([imagejs.data.img.length, imagejs.data.img[0].length]);
		var i, j, k;
		var linked = [];
		for(i=0; i<imagejs.data.img.length; i++){
			for(j=0; j<imagejs.data.img[0].length; j++){
				if(M[i][j]!==0){
					var neighbors = [M[i-1][j-1][0], M[i-1][j+0][0], M[i-1][j+1][0], M[i-0][j-1][0]];
					if(M[i-1][j-1][0]+M[i-1][j]+M[i-1][j+1]+M[i][j-1]==0]){
						labels[i][j] = NextLabel;
						NextLabel+=1;
					} else {
						//Find the smallest label
						L=[labels[i-1][j-1], labels[i-1][j], labels[i-1][j+1], labels[i][j-1]];
						labels[i][j]=jmat.min(L);
						for (k=0; k<L.length; k++){
							linked[k] = union(linked[label], L)
						};
					};
				};
			};
		};
		for(i=0; i<imagejs.data.img.length; i++){
			for(j=0; j<imagejs.data.img[0].length; j++){
				if(M[i][j]!==0){
					labels[i][j] = find(labels[i][j]);
				};
			};
		};
		return labels;
	},
*/

	//putting in a slider fxn for green filter



	histogram:function(){
		for(l=0; l<256; l++){
			counts[l]=0;
		}; 
		var i, j;
		for(i=0; i<imagejs.data.img.length; i++){
			for(j=0; j<imagejs.data.img[0].length; j++){
				counts[imagejs.data.img[i][j][1]] += 1;
			};
		};
		//console.log(counts)
	},

	quickCounts:function(){
		gish.greenFilter(0,77);
		gish.trueBinary(T);
		count_nuclei(T);
		gish.objSizefilter();
	},

	objSizefilter:function(){
		/*
		var i, j, l, group;
		bins = [];
		for(group = 1; group<150; group++){
			objectBin = [];
			for(i=0; i<imagejs.data.img.length; i++){
				for(j=0; j<imagejs.data.img[0].length; j++){
					if(traced[i][j]===group){
						objectBin.push([i,j])
					};
				};
			};
			bins.push(objectBin);
		};
		console.log(objectBin);
		*/
		
		objectBin = [];  //creates empty array, will hold [#pixels in obj 1, #pixels in obj 2, etc.]
		var i, j, l;
		for(l=0; l<150; l++){  //now objectBin = [0, 0, 0...] 150 zeros
			objectBin[l] = 0;
			};
		for(i=0; i<imagejs.data.img.length; i++){
			for(j=0; j<imagejs.data.img[0].length; j++){
				if(traced[i][j]!==0){   //if the pixel is not background, add +1 to the element corresponding to the object number
					objectBin[traced[i][j]]+=1;
				};
			};
		};

		console.log(objectBin);
		console.log(objectBin.length);

		smallObjects = []; //this new array will have the obj # of the objects less than a certain area(ie pixel count)
		for(l=0; l<150; l++){
			if(objectBin[l] < 100){
				smallObjects.push(l);
			};
		};

		console.log(smallObjects);
		console.log(smallObjects.length);
		

		for (var k = 0; k<smallObjects.length; k++){
			for(i=0; i<imagejs.data.img.length; i++){
				for(j=0; j<imagejs.data.img[0].length; j++){
					if(traced[i][j]===smallObjects[k]){
						traced[i][j]=0;
					};
				};
			};
		};
		console.log(traced);
	
		
	},

	makeTracedBinary:function(){
		var i, j;
		for(i=0; i<imagejs.data.img.length; i++){
			for(j=0; j<imagejs.data.img[0].length; j++){
				if(traced[i][j]!==0){
					traced[i][j]=1;
				};
			};
		};
		gish.binary2rgb(traced);
		jmat.imwrite(cvTop, traced);
	},

	greenOverlay:function(x, y){
		gish.greenFilter(x,y);
		gish.adjustAlpha(100, T);
	},

	localMinima:function(){
		var x;
		for(x=1; x<255; x++){
			if (counts[x-1]>counts[x] && counts[x]<counts[x+1]){
				console.log(x);
			};
		};
	},
	
	localMinimabig:function(){
		var x;
		for(x=4; x<252; x++){
			if ((counts[x-4]+counts[x-3]+counts[x-2])>(counts[x-1]+counts[x]+counts[x+1]) && (counts[x-1]+counts[x]+counts[x+1])<(counts[x+2]+counts[x+3]+counts[x+4])){
				console.log(x);
			};
		};
	},

	localMinimagiant:function(){
		var x;
		var gmina = [];
		for(x=7; x<249; x++){
			if ((counts[x-7]+counts[x-6]+counts[x-5]+counts[x-4]+counts[x-3])>(counts[x-2]+counts[x-1]+counts[x]+counts[x+1]+counts[x+2]) &&
				(counts[x-2]+counts[x-1]+counts[x]+counts[x+1]+counts[x+2])<(counts[x+3]+counts[x+4]+counts[x+5]+counts[x+6]+counts[x+7])) {
				gmina.push(x);
			};
		};
		return gmina;
	},

/*
	localMaxima:function(){
		var x;
		for(x=1; x<255; x++){
			if(counts[x-1]<counts[x] && counts[x+1]<counts[x]){

			}
		}
	},
*/


	unionize:function(){
		//console.log(counts);
		gish.clearCounts();
		gish.histogram();
		var x;
		var smin = [];
		for(x=1; x<255; x++){
			if (counts[x-1]>counts[x] && counts[x]<counts[x+1]){
				smin.push(x);
			};
		};
		var y;
		var bmina = [];
		for(y=4; y<252; y++){
			if ((counts[y-4]+counts[y-3]+counts[y-2])>(counts[y-1]+counts[y]+counts[y+1]) && (counts[y-1]+counts[y]+counts[y+1])<(counts[y+2]+counts[y+3]+counts[y+4])){
				bmina.push(y);
			};
		};
		var z;
		var gmina = [];
		for(x=7; x<249; x++){
			if ((counts[x-7]+counts[x-6]+counts[x-5]+counts[x-4]+counts[x-3])>(counts[x-2]+counts[x-1]+counts[x]+counts[x+1]+counts[x+2]) &&
				(counts[x-2]+counts[x-1]+counts[x]+counts[x+1]+counts[x+2])<(counts[x+3]+counts[x+4]+counts[x+5]+counts[x+6]+counts[x+7])) {
				gmina.push(x);
			};
		};

		console.log(smin);
		console.log(bmina);
		console.log(gmina);
		var i, j, k;
		var union = [];
		for(i=0; i<smin.length; i++){
			for(j=0; j<bmina.length; j++){
				for(k=0; k<gmina.length; k++){
					if (smin[i]===bmina[j] && smin[i]===gmina[k]){
						//console.log(smin[i]);
						union.push(smin[i]);
					};
				};
			};
		};
		if (union.length )
		console.log(union);
		gsetone = union[0];
		gsettwo = union[union.length-1];
		return [union[0], union[union.length-1]];
	},

	totalProgram:function(){
		gish.unionize();
		gish.greenFilter(0, gsetone);
		fetalM = T.clone();
		gish.adjustAlpha(100, fetalM);
		gish.makeClear(fetalM);
		gish.greenFilter(gsetone, gsettwo);
		maternalM = T.clone();
	},

	totalArea:function(){
		gish.unionize();  //finds the threshold values, stores as gsetone & gsettwo
		gish.greenFilter(0, gsetone); //creates a black and white image mask for fetal cells
		var areaF = gish.areaWhite(); //finds the area of the fetal cell mask, stores 
		gish.greenFilter(gsetone, gsettwo); //creates a black and white image mask for maternal cells
		var areaM = gish.areaWhite(); //finds the area of the maternal cell mask, stores
		console.log(areaF, areaM, areaF/areaM);
	},

	totalAreaUser:function(greenOne, greenTwo){
		gish.greenFilter(0, greenOne); //creates a black and white image mask for fetal cells
		var areaF = gish.areaWhite(); //finds the area of the fetal cell mask, stores 
		gish.greenFilter(greenOne, greenTwo); //creates a black and white image mask for maternal cells
		var areaM = gish.areaWhite(); //finds the area of the maternal cell mask, stores
		console.log(areaF, areaM, areaF/areaM);
	},

	clearCounts:function(){
		for(var l=0; l<256; l++){
			counts[l]=0;
		};
	},

	getSize:function(){
		var s=[imagejs.data.img.length, imagejs.data.img[0].length, 4];
		return s;
	},

	getRGB:function(x,y){ // jmat,from x,y pixel coordinate pair extract RGB vector
		return imagejs.data.img[x][y].slice(0,3);
	},

	//Learn how to use forEach Statments properly!!!

	greenBinaryfetal:function(){
		gish.greenFilter(0,96);
		gish.trueBinary(T);
		return T;
	},


/*
	binaryMcopy:function(input){
		var i, j;
		var myCopy = []; 
		for (i=0; i<input.length; i++){
			for (j=0; j<input[0].length; j++){
				myCopy.push = input[i][j];
			}
		}
		return myCopy;
	},
*/

/*
	dilate:function(M){ 
		gish.trueBinary(M);

		janus = JSON.parse(JSON.stringify(M));
		for (i=0; i<T.length; i++){
			for (j=0; j<T[0].length; j++){
				if (M[i][j] == 1) {
					janus[i][j] = 1;
					if (i>0) janus[i-1][j] = 1;
					if (j>0) janus[i][j-1] = 1;
					if (i+1<M.length) janus[i+1][j] = 1;
					if (j+1<M[0].length) janus[i][j+1] = 1;			
				}
			}
		}
		gish.binary2rgb(janus);
		gish.binary2rgb(M);
		jmat.imwrite(cvTop, janus);
	},
*/

	dilate:function(M){ //4-connectivety dilation
		gish.trueBinary(M);
		var biclone = M.clone();
		for(i=0; i<M.length; i++){
			for(j=0; j<M[0].length; j++){
				if(biclone[i][j] == 1){
					M[i][j] = 1;
					if (i>0) M[i-1][j] = 1;
					if (j>0) M[i][j-1] = 1;
					if (i+1<M.length) M[i+1][j] = 1;
					if (j+1<M[0].length) M[i][j+1] = 1;	
				}
			}
		}
		gish.binary2rgb(M);
		gish.adjustAlpha(100, M);
		gish.makeClear(M);
	},

/*
	erode:function(M){ 
		gish.trueBinary(M);
		janus = JSON.parse(JSON.stringify(M));
		for (i=0; i<T.length; i++){
			for (j=0; j<M[0].length; j++){
				if (M[i][j] == 0) {
					janus[i][j] = 0;
					if (i>0) janus[i-1][j] = 0;
					if (j>0) janus[i][j-1] = 0;
					if (i+1<M.length) janus[i+1][j] = 0;
					if (j+1<M[0].length) janus[i][j+1] = 0;			
				}
			}
		}
		gish.binary2rgb(janus);
		gish.binary2rgb(M);
		jmat.imwrite(cvTop, janus);
	},
*/

	erode:function(M){ //4-connectivety erosion
		gish.trueBinary(M);
		var biclone = M.clone();
		for(i=0; i<M.length; i++){
			for(j=0; j<M[0].length; j++){
				if(biclone[i][j] == 0){
					M[i][j] = 0;
					if (i>0) M[i-1][j] = 0;
					if (j>0) M[i][j-1] = 0;
					if (i+1<M.length) M[i+1][j] = 0;
					if (j+1<M[0].length) M[i][j+1] = 0;	
				}
			}
		}
		gish.binary2rgb(M);
		gish.adjustAlpha(100, M);
		gish.makeClear(M);
	},

	open:function(M){
		gish.erode(M);
		gish.dilate(M);
	},

	close:function(M){
		gish.dilate(M);
		gish.erode(M);
	},

/*
	edgeImp:function(){
		jmat.imwrite((cvTop, jmat.edge(gish.trueBinary(janus)));
	},
*/

	trueBinary:function(M){ //should I store the binary data as 1 or [1], 0 or [0]
		var i, j;
		if(M[0][0].length===4){
			for (i=0; i<imagejs.data.img.length; i++) {
				for (j=0; j<imagejs.data.img[0].length; j++) {
					if (M[i][j][0]===255){
						M[i][j]=1;
					} else {
						M[i][j]=0;
					}	
				}
			}
		} else {
			console.log("Image not in RGB-alpha Format!")
		}
		return M;
	},

	binary2rgb:function(M){
		if(M[0][0].length!==4){
			var i, j;
			for (i=0; i<imagejs.data.img.length; i++) {
				for (j=0; j<imagejs.data.img[0].length; j++) {
					if (M[i][j]===1){
						M[i][j]=[255, 255, 255, 255];
					} else {
						M[i][j]=[0, 0, 0, 255];
					}	
				}
			}
		} else {
			console.log("Image not in true binary format!")
		}
		return M;
	},

	makeClear:function(M){
		var i, j;
		for (i=0; i<imagejs.data.img.length; i++) {
			for (j=0; j<imagejs.data.img[0].length; j++) {
				if (M[i][j][0]==0) {
					M[i][j][3]=0;
				}
			}
		}
		jmat.imwrite(cvTop, M);
	},

	getFetalcells:function(greenOne){
		gish.greenFilter(0,greenOne);
		gish.trueBinary(T);
		var w = jmat.edge(T);
		gish.binary2rgb(w);
		jmat.imwrite(cvTop, w);
	},

	colorMagnitude:function(x,y){ // Pass array of RGB and return the magnitude of the color vector
		var a=gish.getRGB(x,y)[0];
		var b=gish.getRGB(x,y)[1];
		var c=gish.getRGB(x,y)[2];
		var d=Math.sqrt(Math.pow(a,2)+Math.pow(b,2)+Math.pow(c,2))
		return d
	},

	colorAverage:function(x,y){ // Pass array of RGB and return the magnitude of the color vector
		var a=gish.getRGB(x,y)[0];
		var b=gish.getRGB(x,y)[1];
		var c=gish.getRGB(x,y)[2];
		var d= (a+b+c)/3
		return d
	},

	setThreshold:function(x,y){
		if(gish.colorMagnitude(x,y)>300) {
			T[x][y]=[0, 0, 0, 255];
		} else {
			T[x][y]=[255, 255, 255, 255];
		}
	},

	setThreshold2:function(x,y){
		if(gish.colorAverage(x,y)>130) {
			T[x][y]=[0, 0, 0, 255];
		} else {
			T[x][y]=[255, 255, 255, 255];
		}
	},

	binary:function(){ 
		var x=imagejs.data.img;
		sz=gish.getSize();
		T=jmat.zeros(sz[0], sz[1], sz[2])
		for (i=0; i<imagejs.data.img.length; i++) {
			for (j=0; j<imagejs.data.img[0].length; j++) {
				gish.setThreshold(i, j);	
			}

		}
		jmat.imwrite(cvTop, T);
	},

	compareRG:function(i, j, rgdrop){
		var i, j, rgdrop;
		if (imagejs.data.img[i][j][0]>imagejs.data.img[i][j][1]+rgdrop){
			T[i][j]=[255, 255, 255, 255];
		} else {
			T[i][j]=[0, 0, 0, 255];
		};
	},

	compareG:function(i, j, low, high){
		var i, j, low, high;
		if (imagejs.data.img[i][j][1]>low && imagejs.data.img[i][j][1]<high){
			T[i][j]=[255, 255, 255, 255];
		} else {
			T[i][j]=[0, 0, 0, 255];
		};
	},

	greenFilter:function(low, high){ //red: (0,96) pink: (100,156)
		var i, j, low, high;
		sz=gish.getSize();
		T=jmat.zeros(sz[0], sz[1], sz[2])
		for (i=0; i<imagejs.data.img.length; i++) {
			for (j=0; j<imagejs.data.img[0].length; j++) {
				gish.compareG(i, j, low, high);	
			}

		}
		jmat.imwrite(cvTop, T);
	},

	greenRatio:function(low1, high1, low2, high2){
		var low1, high1, low2, high2, totalr, totalp;
		gish.greenFilter(low1, high1);
		totalr = gish.areaWhite();
		gish.greenFilter(low2, high2);
		totalp = gish.areaWhite();
		console.log(totalr/totalp*100+"%");
	},

	ratioRedpink:function(a, b){ //get params, 70 , 18
		var a, b, c, d;
		gish.binary3(a);
		c = gish.areaWhite();
		gish.binary3(b);
		d = gish.areaWhite();
		console.log(c/d);	
	},


	adjustAlpha:function(alpha, M){ //adjusts the alpha value of T, so far Red cell~+70, pink~+18
		var i, j, alpha;
		for (i=0; i<imagejs.data.img.length; i++) {
			for (j=0; j<imagejs.data.img[0].length; j++) {
				M[i][j][3]=alpha;
			}
		}
		jmat.imwrite(cvTop, M);
	},

	invertbw:function(M){
		var i, j;
		for(i=0; i<M.length; i++){
			for(j=0; j<M[0].length; j++) {
				if (M[i][j][0]==255){
					M[i][j]=[0, 0, 0, 255];
				} else {
					M[i][j]=[255, 255, 255, 0];
				}
			}
		}
		jmat.imwrite(cvTop, M);
	},

//Demonstration functions

	maternalOverlay:function(){
		gish.greenFilter(100,156);
		gish.open(T);
		gish.invertbw(janus);
		gish.adjustAlpha(100, janus);
	},

	binary3:function(rgdrop){ 
		var x=imagejs.data.img;
		var rgdrop;
		sz=gish.getSize();
		T=jmat.zeros(sz[0], sz[1], sz[2])
		for (i=0; i<imagejs.data.img.length; i++) {
			for (j=0; j<imagejs.data.img[0].length; j++) {
				gish.compareRG(i, j, rgdrop);	
			}

		}
		jmat.imwrite(cvTop, T);
	},

	scanner:function(func){ //What/How is this function used?
		for (i=0; i<imagejs.data.img.length; i++) {
			for (j=0; j<imagejs.data.img[0].length; j++) {
				func;
			}
		}
		jmat.imwrite(cvTop, T);
	},

	areaWhite:function(){
		var i, j;
		var total = 0;
		var background = 0;
		for (i=0; i<imagejs.data.img.length; i++) {
			for (j=0; j<imagejs.data.img[0].length; j++) {
				if(T[i][j][0]===255){
					total+=1;
				} else {
					background+=1;
				}
			}
		}
		//console.log(total);
		//console.log(background);
		//console.log("Ratio of white:background" + " " +total/background*100 +"%");
		return total;
	},



	binary2:function(){ 
		var x=imagejs.data.img;
		sz=gish.getSize();
		T=jmat.zeros(sz[0], sz[1], sz[2])
		for (i=0; i<imagejs.data.img.length; i++) {
			for (j=0; j<imagejs.data.img[0].length; j++) {
				gish.setThreshold2(i, j);	
			}

		}
		jmat.imwrite(cvTop, T);
	},

	getNeighbors:function(i, j){
		var neighborhood = [
			imagejs.data.img[i-1][j-1][0], imagejs.data.img[i-1][j+0][0], imagejs.data.img[i-1][j+1][0],
			imagejs.data.img[i-0][j-1][0], imagejs.data.img[i-0][j+0][0], imagejs.data.img[i-0][j+1][0],
			imagejs.data.img[i+1][j-1][0], imagejs.data.img[i+1][j+0][0], imagejs.data.img[i+1][j+1][0]
			];
		return neighborhood;
	},

	getNeighborsGENERAL:function(M, i, j){
		var neighborhood = [
			M[i-1][j-1][0], M[i-1][j+0][0], M[i-1][j+1][0],
			M[i-0][j-1][0], M[i-0][j+0][0], M[i-0][j+1][0],
			M[i+1][j-1][0], M[i+1][j+0][0], M[i+1][j+1][0]
			];
		return neighborhood;
	},

	getNeighborsbig:function(i, j){
		var neighborhood = [
			imagejs.data.img[i-2][j-2][0], imagejs.data.img[i-2][j-1][0], imagejs.data.img[i-2][j-0][0], imagejs.data.img[i-2][j+1][0], imagejs.data.img[i-2][j+2][0],
			imagejs.data.img[i-1][j-2][0], imagejs.data.img[i-1][j-1][0], imagejs.data.img[i-1][j-0][0], imagejs.data.img[i-1][j+1][0], imagejs.data.img[i-1][j+2][0],
			imagejs.data.img[i-0][j-2][0], imagejs.data.img[i-0][j-1][0], imagejs.data.img[i-0][j+0][0], imagejs.data.img[i-0][j+1][0], imagejs.data.img[i-0][j+2][0],
			imagejs.data.img[i+1][j-2][0], imagejs.data.img[i+1][j-1][0], imagejs.data.img[i+1][j+0][0], imagejs.data.img[i+1][j+1][0], imagejs.data.img[i+1][j+2][0],
			imagejs.data.img[i+2][j-2][0], imagejs.data.img[i+2][j-1][0], imagejs.data.img[i+2][j+0][0], imagejs.data.img[i+2][j+1][0], imagejs.data.img[i+2][j+2][0]
			];
		return neighborhood;
	},

	findMedian:function(i, j){
		return gish.getNeighbors(i, j).sort(function(a,b) {return a-b})[4];
	},

	findMedianGENERAL:function(M, i, j){
		return gish.getNeighborsGENERAL(M, i, j).sort(function(a,b) {return a-b})[4];
	},

	findMedianbig:function(i, j){
		return gish.getNeighborsbig(i, j).sort(function(a,b) {return a-b})[13];
	},

	medianFilterbig:function(){
		var i, j, sz, T, temp;
		sz=gish.getSize();
		T=jmat.zeros(sz[0], sz[1], sz[2])
		for (i=2; i<imagejs.data.img.length-2; i++) {
			for (j=2; j<imagejs.data.img[0].length-2; j++) {
				temp = gish.findMedianbig(i, j);
				T[i][j]=[temp,temp,temp,255];
				//T[i][j]=gish.findMedian(i,j);
				//console.log(T[i][j]);
			};
		};
		jmat.imwrite(cvTop, T);
		console.log("Done!");
	},

	generateCoord:function(i, j, para){ //
		var i, j, s, v, para;
		var coords = [];
		for (s=(-para); s<=para; s++){
			for(v=(-para); v<=para; v++){
				coords.push(imagejs.data.img[i+s][j+v]);
			};
		};
		return coords;
	},

	extractRGB:function(i, j, para, rgba){
		var coords = gish.generateCoord(i, j, para);
		var colors = [];
		for (l=0; l<coords.length; l++){
			colors.push(coords[l][rgba]);
		}
		console.log("done")
		return colors;
	},

	medianFilter:function(){
		var i, j, sz, T, temp;
		sz=gish.getSize();
		T=jmat.zeros(sz[0], sz[1], sz[2])
		for (i=2; i<imagejs.data.img.length-2; i++) {
			for (j=2; j<imagejs.data.img[0].length-2; j++) {
				temp = gish.findMedian(i, j);
				T[i][j]=[temp,temp,temp,255];
			};
		};
		jmat.imwrite(cvTop, T);
	},

	medianFilterGENERAL:function(M){
		var i, j, temp;
		var N = M.clone();
		for(i=1; i<imagejs.data.img.length-1; i++){
			for(j=1; j<imagejs.data.img[0].length-1; j++){
				temp = gish.findMedianGENERAL(M, i, j);
				N[i][j]=[temp,temp,temp,255];
			};
		};
		M = N.clone();
		jmat.imwrite(cvTop, M);
		console.log("Done!")
	},

	applyMask:function(f){  //Known problems: Border-issue, Only works for Grayscale images
		var i, j, sz, T, temp, f;
		sz=gish.getSize();
		T=jmat.zeros(sz[0], sz[1], sz[2])
		for (i=2; i<imagejs.data.img.length-2; i++) {
			for (j=2; j<imagejs.data.img[0].length-2; j++) {
				temp = f(i, j);
				T[i][j]=[temp,temp,temp,255];
			};
		};
		jmat.imwrite(cvTop, T);
	},

	medianFilter2: function(){
		gish.applyMask(gish.findMedian);
	},

	meanFilter: function(){
		gish.applyMask(gish.findMeangrayscale);
	},

	origImg: function(){
		T=imagejs.data.img;
		jmat.imwrite(cvTop, T);
	},

	helloWorld:function(){
		console.log("Hello World");
	},

	findMeangrayscale:function(i, j){
		var i, j, s, sum; 
		var sum = 0;
		for (s=0; s<gish.getNeighbors(i,j).length; s++){
			sum+=gish.getNeighbors(i, j)[s];
		};
		return (sum/gish.getNeighbors(i,j).length);
	},

	findBackground:function(){
		var i, j;
		for (i=0; i<imagejs.data.img.length; i++){
			for (j=0; j<imagejs.data.img[0].length; j++){
				if (mmask[i][j][0]===255 || (fmask[i][j][0]+fmask[i][j][1]+fmask[i][j][2])>660){
					imagejs.data.img[i][j]=[255, 255, 255, 255];
				};
			};
		};
	},

	cleanImg:function(){
		var i, j;
		for (i=0; i<imagejs.data.img.length; i++){
			for (j=0; j<imagejs.data.img[0].length; j++){
				if ((imagejs.data.img[i][j][0]+imagejs.data.img[i][j][1]+imagejs.data.img[i][j][2])>660){
					fmask[i][j]=[255, 255, 255, 255];
				};
			};
		};
	},

	invertBackground:function(){
		var i, j;
		for (i=0; i<imagejs.data.img.length; i++){
			for (j=0; j<imagejs.data.img[0].length; j++){
				if ((imagejs.data.img[i][j][0]+imagejs.data.img[i][j][1]+imagejs.data.img[i][j][2])==765){
					imagejs.data.img[i][j]=[0, 0, 0, 255];
				} else {
					imagejs.data.img[i][j]=[255, 255, 255, 255];
				};
			};
		};
	},



	maskify:function(){
		var i, j;
		var greens = [];
		for (i=0; i<imagejs.data.img.length; i++){
			for (j=0; j<imagejs.data.img[0].length; j++){
				if (masky[i][j][0]===255 && masky[i][j][1]===255){
					greens.push(imagejs.data.img[i][j][1]);
				};
			};
		};
		return greens;
	},

// Sort numerically and ascending:
// var myarray=[25, 8, 7, 41]
// myarray.sort(function(a,b){return a - b}) //Array now becomes [7, 8, 25, 41]

/*
	getMask:function(){
		var i, j;
		for(i=0; imagejs.data.img.length<0; i++){
			for(j=0; imagejs.data.img[0].length; j++){
				if (imagejs.data.img[i][j][0]=255){
					add
				}  
			}
		}
	}
*/


	//Canny Edge Detection Theme
	gaussian:function(){
		var kernel = 1/159[
			[2,  4,  5, 4,  2],
			[4,  9, 12, 9,  4],
			[5, 12, 15,12,  5],
			[4,  9, 12, 9,  4],
			[2,  4,  5, 4,  2]
		]
	}

	}

/*
seanCounter:function () {
    'use strict';

 // Pragmas


 // Prerequisites

    if (typeof imagejs !== 'object') {
        throw new Error('ImageJS has not been loaded.');
    }

 // Declarations

    var count_nuclei;
 // Definitions

    count_nuclei = function (bw_matrix){
        var col, coord, stack, i, j, m, n, partition, row, traced;
        m = bw_matrix.length;
        if ((m === null) || (m === undefined)) {
            throw new TypeError('"extractSegs" expects binary matrix');
        }
        n = bw_matrix[0].length;
        partition = 0;
        stack = [];
        traced = new Array(m);
        for (i = 0; i < m; i += 1) {
            traced[i] = new Array(n);
        }
        for (i = 0; i < m; i += 1) {
            for (j = 0; j < n; j += 1) {
                if (traced[i][j] === undefined) {
                 // If we have not yet visited this pixel, we will check to
                 // see if it would represent a pixel of interest or not ...
                    if (bw_matrix[i][j] === 0) {
                     // Even though it's not part of a nucleus, we still need
                     // to mark it so we won't repeat the check again later.
                        traced[i][j] = 0;
                    } else {
                     // Since this pixel is part of a partition and we haven't
                     // visited it yet, it must also be part of a new partition
                     // that we haven't visited yet, because any time we find a
                     // new partition, we look for all its members, too.
                        partition += 1;
                        stack.push([i, j]);
                    }
                }
                while (stack.length > 0) {
                 // This is the fun part. Assuming that all pixels comprising
                 // a given partition can be visited just by wandering around
                 // on adjacent pixels that all belong to the same partition,
                 // we can then discover and mark all members of a partition
                 // by adding neighbors to a stack and looping until the stack
                 // is exhausted. The [function] recursion stack depth limit
                 // is unpredictable is JavaScript, and there is no tail-call
                 // optimization; we should avoid the use of recursion, then,
                 // because for large images, we might need to recurse millions
                 // of times and would very probably recurse too deeply. One
                 // really nice bonus, though, is that a non-recursive solution
                 // runs faster because it avoids the extra overhead from the
                 // recursive function calls. By nesting this `while` loop
                 // inside two `for` loops and using our continuity assumption
                 // (which may actually be a "connectedness" assumption), we
                 // can then extract entire partitions in only one pass :-)
                    coord = stack.pop();
                    row = coord[0];
                    col = coord[1];
                    if ((0 <= row) && (row < m) && (0 <= col) && (col < n) &&
                            (traced[row][col] === undefined)) {
                     // Only look at this coordinate pair if we haven't ever
                     // looked at it before. This strategy helps avoid some of
                     // the Moore-Neighbor algorithm's non-convergence problems
                     // by shrinking the search space monotonically each step.
                        if (bw_matrix[row][col] > 0) {
                         // Add neighborhood to the stack.
                            Array.prototype.push.apply(stack, [
                                [row + 1,   col + 0],   //- North
                                [row + 1,   col + 1],   //- North-East
                                [row + 0,   col + 1],   //- East
                                [row - 1,   col + 1],   //- South-East
                                [row - 1,   col + 0],   //- South
                                [row - 1,   col - 1],   //- South-West
                                [row + 0,   col - 1],   //- West
                                [row + 1,   col - 1]    //- North-West
                            ]);
                         // Store partition number into `traced`.
                            traced[row][col] = partition;
                        } else {
                            traced[row][col] = 0;
                        }
                    }
                }
            }
        }
        return partition;
    };
    
    window.count_nuclei=count_nuclei;
 // That's all, folks!

    return;

	}();

*/

