function callbackWhenNiftiiLoaded() {

	console.log( "huhu" );
	
	magicScroll();
}

var wertderhochzaehlt = 40;

function magicScroll()
{
	var canvas = document.getElementById( "c1" );

	var dims = niftii.getDims();

	//canvas.width = dims.nx;
	//canvas.height = dims.nz;
	var ctx = canvas.getContext("2d");
	var imageData = ctx.getImageData( 0, 0, dims.nx, dims.nz );
	
	var slice = niftii.getImage( "coronal", wertderhochzaehlt++ );
	
	for( var i = 0; i < imageData.data.length; ++i )
	{
		imageData.data[i] = slice.data[i];

	}
	
	ctx.putImageData( imageData, 0,0 );
	
	var url = canvas.toDataURL();

    var newImg = document.getElementById( "img1" );
	
    newImg.src = url;
	console.log( newImg.width + " " + newImg.height );
	newImg.height = newImg.height * 2;


	
	if ( wertderhochzaehlt >= dims.ny )
	{
		wertderhochzaehlt = 0;
	}
	
	//window.setTimeout( magicScroll, 100 );
}


console.log( "hallo" );
var niftii = new Niftii();
niftii.load( "t1.nii", callbackWhenNiftiiLoaded );


