
#Mage

-----
##Intro
What is THREE.js? It's a pretty damn powerful javascript library, which allows you to create WebGL projects with just a few lines of code. It's the de facto "WebGL for Dummies". It's the result of years of amazing work by Riccardo Cabello (aka [@mrdoob](https://twitter.com/mrdoob)) and Altered Qualia ( [@alteredq](https://twitter.com/alteredq)), you can find their works and projects respectively on [mrdoob.com](http://mrdoob.com) and [alteredqualia.com](http://alteredqualia.com/) .

Of course, tons of contributors made this awesome project a reality. Thanks, contributors.

So, I really love THREE.js. It's incredible, and you can achieve truly amazing stuff, and I'm the perfect user for this library: I've never fully understood how WebGL works. Yep, I'm a dummy.

#####EXAMPLES

These are a few examples of my "engine" working on very simple games.
[WORM](http://marcostagni.com/projects/worm)

-----
####Creating a THREE.js Boilerplate

I made a lot of experiments using this library, and I came up creating a few chunks of code that needed other external libraries, along with tons of javascript to keep them organized. I decided to create a simple tool, which i named "[Wage](https://github.com/marco-ponds/Wage)" (Wannabe A Game Engine, although it's still not a game engine) with the main purpose to achieve a simple Game Engine built on top of THREE.js.

The code behind the scene is still pretty messy and awful, so please be merciful if you decide to dig inside my repository. Although my bad coding skills, i decided to publicly distribute this tool, hoping that it will grow and become a better piece of software.

######Logic
The main logic of Wage is the same of every THREE.js project (and of every simple game): you create a scene, add objects to it, then you start a "Control loop", where you catch user events, update your game logic and update the scene, trying to achieve the highest possibile fps value (We do love smooth animations, isnt'it?).

I decided to follow a very basic copy og Unity3D logic ( You don't know what Unity3D is? Please, do yourself a [favor](http://unity3d.com).) : You can add your objects to the scene, change their properties (This is always brought to you by THREE.js), then  attach a custom "render" method, to modify and create a custom behaviour for your object, instead of having to fill your main loop with tons of updates on scene's objects.

So, just to make you sure you understand what can be done:
(We create a simple cube, then we'll add it to the scene.)
```javascript
	var geometry = new THREE.CubeGeometry(20, 20, 20);
	var material = new THREE.MeshBasicMaterial({
    	color: 0x00ff00,
        wireframe : true
    });
	var cube = new Mesh(geometry, material);
```
I'm preparing a detailed Wiki for the whole project, right now you can only ask directly to me if you need explanations.

Of course, you do have access to the main game loop, you just need to implement the following method:

```javascript
	Game.update = function() {
    	console.log("Hey mum, no hands!");
    }
```
This method is pretty self-explanatory. Inside of it you can do whatever you need to update your game's logic. There are no actual limitations on what you can achieve or try to do inside the update method.

<br>
######Creating a simple application

##Using NPM:

I decided to put the whole project on npm, so you can easily create your project while always beeing up to date with my modifications. You only have to run this command:
```python
	npm install -g wage
```

Now the wage package is available for your computer. The only thing left to do is create your project. Simply run:

```python
	wage create amazingProject
```
Wage will now create a folder named "amazingProject", ready to be edited. Pretty neat, isn't it? You're now read to jump to the second step of "What if I don't have Node.js?" section.

##What if i don't have node.js? (you really should install it.)

1) First step: Fork the [github repository](https://github.com/marco-ponds/Wage).
You should now have a folder named "Wage": inside of it you can see a folder named "Build"; the only thing you have to do is copy and paste this directory wherever you want to put your proectj. Example: Copy and paste Build folder's content inside your folder "AmazingProject".

2) Edit your app.
Open the "app" folder: inside, you will find a main.js script. This is the main file of your project. It's heavily commented, so consider to spend a few minutes reading each comment and each explanation.

3) Understanding methods.
So, you have to understand only a few methods, right now: i will present the in order of comparison.

**preload.**
First of all, notice the "preload" method: this will be called before the scene creation, and will allow you to perform heavy calculation/operations just before the scene initialization. The "preload" method has a callback method, which you need to call in order to proceed in your app flow. Just for example, you can load json 3d models right here, and having them loaded when the scene is about to be created. The callback method will cause a few things. It will call the method "prepareScene" and "progressAnimation" method. To modify your preLoad, you will need to write:

```javascript
	preload = function(callback) {
    	//your very own implementation
        callback();
    };
```

**prepareScene.**
This method has only a logic difference from the preload method. I decided to create this function in order to perform operations needed by the scene, just before its creation. So for example, you can create a complex particle system or modify a huge 3d model ( loaded by the preload method), so that the scene will render faster and your users will never be annoyed by a black screen waiting for something to happen. After the "prepareScene" method, Wage will call the "progressAnimation" method. To modify your prepareScene, you will need to write:

```javascript
	function prepareScene() {
    	//your very own implementation
    }
```

**progressAnimation.**
This method is your custom animation on the loader, and you can do whatever you want to make you loader disappear. You can also create your custom loader, modifying the index.html file inside your simpleApp folder. The "progressAnimation" method will give you a callback method, which you will need to call in order to proceed the app flow. Your app is now ready to call the onCreate method. To modify your progressAnimation, you will need to write:

```javascript
	progressAnimation = function(callback) {
    	//your very own implementation
        callback();
    };
```

**onCreate.** This is the method that Wage will call just after the scene creation. Here, you will be able to add your meshes, and after that the main loop will start. Here, you can insert the code you saw before (when we created the box) : for each mesh, you can add a custom "_render" method (just as explained before). You don't have to add this custom method if you don't need to.

To add each mesh to the scene you will need to call:
```javascript
	var m = new Mesh(geometry, material);
```

You can now paste the example code you saw before just after the "//add your code HERE" comment. Now, the only thing left to do is launching your app.

5) Launching your app.
You simpleApp folder provides you a script called "run". You just have to launch it to see your page running on localhost. Just type:

```bash
	./run
```

and you're good to go. The "run" script uses the python module SimpleHTTPServer, so you will need to set up Python first. When you finally manage to launch your app, you can go [here](http://localhost:8000) to see it live.

If you did everything correctly, you will see something like [this](http://marcostagni.com/projects/simpleApp).

----
####Conclusion

Your journey is almost over. There are more things inside Wage, but this is only the very first steps you need to know to start your very own project. A much detailed wiki will be soon available on github.

Check my blog often, because i will upload a few interesting projects using Wage, so you can see what i was able to achieve using a very simple tool.
