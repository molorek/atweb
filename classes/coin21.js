function coin_preload(){
	game.load.image('coin_yel','assets/coins/coin_yel.png');
	game.load.image('coin_or','assets/coins/coin_or.png');
	game.load.image('coin_ice','assets/coins/coin_ice.png');
	game.load.image('coin_red','assets/coins/coin_red.png');
	game.load.image('coin_viol','assets/coins/coin_viol.png');
	
	game.load.image('coin_magn','assets/coins/coin_magn.png');
	game.load.image('coin_magn_ice','assets/coins/coin_magn_ice.png');
}
console.log("coin.js loaded");

CoinEff = function (game, x, y, type) { 
	if (type=='coin_ice'){
		Phaser.Sprite.call(this, game, x, y, 'coin_magn_ice');
	}else{
		Phaser.Sprite.call(this, game, x, y, 'coin_magn');
	}
	eff_group.add(this);
	
	this.width=0;
	this.height=0;
	//центрирование спрайта
	this.anchor.x=.5;
	this.anchor.y=.5;
	
	//окрашиваем магнитное поле монеты, в зависимости от её типа
	switch(type){
		case 'coin_yel':
			this.tint=Phaser.Color.getColor(223, 228, 56);
		break;
		
		case 'coin_or':
			this.tint=Phaser.Color.getColor(245, 201, 49);
		break;
				
		case 'coin_red':
			this.tint=Phaser.Color.getColor(220, 62, 62);
		break;
		
		case 'coin_viol':
			this.tint=Phaser.Color.getColor(126, 46, 237);
		break;
	}	
}

CoinEff.prototype = Object.create(Phaser.Sprite.prototype);
CoinEff.prototype.constructor = CoinEff;

CoinEff.prototype.update = function(){
	
	this.scale.x+=(10-this.scale.x)*.045;
	this.scale.y=this.scale.x;	
	this.alpha+=(-.2-this.alpha)*.04;

	this.y=triangle.y;
	this.x=triangle.x;
	
	//опускаем монеты вниз, для имитации бесконечного игрового поля
	if (wall_timer<=0){
		this.y+=384;
	}
	
	//удаление
	if (this.alpha<0){
		this.destroy();
	}
}


Coin = function (game, x, y, type) { 
	//вызываем спрайт для отрисовки
	Phaser.Sprite.call(this, game, x, y, type);
	if (type=='coin_ice'){
		this.magn=coin_group.create(x, y, 'coin_magn_ice');
	}else{
		this.magn=coin_group.create(x, y, 'coin_magn');
	}
	//добавляем спрайт в группу слоёв
	coin_group.add(this);
	
	//настраиваем спрайт монеты
	this.z=2;
	this.width=this.width/2;
	this.height/=2;
	this.x=x;
	this.y=game.math.snapTo(this.y, 64, 0);
	this.predef_y=this.y;
	this.type=type;
	//центрирование спрайта
	this.anchor.x=.5;
	this.anchor.y=.5;
	//всё тоже самое, только для магнитного поля
		this.magn.z=1;
		this.magn.anchor=this.anchor;
		this.magn.width=this.width;
		this.magn.height=this.height;
	//idle-анимация монеты
	this.idle_dir=-1; //-1 - вверх, 1 - вниз
	this.idle_y=0;
	//коллизия
	this.player_colld_magn=0;
	this.player_colld=0;
	this.player_colld_x=0;
	this.player_colld_y=0;
	this.pickedup_y=0;
	this.pickedup_x=0;
	this.tmp_x=0;
	this.player_colld_cycle=0;
	this.create_eff=1;
	this.coineff=0;
	
	//окрашиваем магнитное поле монеты, в зависимости от её типа
	switch(type){
		case 'coin_yel':
			this.magn.tint=Phaser.Color.getColor(223, 228, 56);
		break;
		
		case 'coin_or':
			this.magn.tint=Phaser.Color.getColor(245, 201, 49);
		break;
		
		case 'coin_red':
			this.magn.tint=Phaser.Color.getColor(220, 62, 62);
		break;
		
		case 'coin_viol':
			this.magn.tint=Phaser.Color.getColor(126, 46, 237);
		break;
	}	
};

Coin.prototype = Object.create(Phaser.Sprite.prototype);
Coin.prototype.constructor = Coin;

Coin.prototype.update = function() {
	//idle-анимация
	if (this.idle_dir==-1){
		if (this.idle_y>-2){
			this.idle_y+=(-3-this.idle_y)*.025;
		}else{
			this.idle_dir=1
		}
	}else if (this.idle_dir==1){
		if (this.idle_y<2){
			this.idle_y+=(3-this.idle_y)*.025;
		}else{
			this.idle_dir=-1
		}
	}

	//опускаем монеты вниз, для имитации бесконечного игрового поля
	/*if (wall_timer<=0){
		this.predef_y+=384;
	}*/

	//детектор столкновений
	var coin_place=new Phaser.Point(this.x,this.y);
	if (Phaser.Point.distance(new Phaser.Point(triangle.x,triangle.y), coin_place, false)<64 && !this.player_colld_magn 
	&& this.y>triangle.y-32 && this.y<triangle.y+32){
		if (this.x>triangle.x){
			this.player_colld_x=-8;
		}else{
			this.player_colld_x=8;
		}			
		this.player_colld_magn=1;
		this.player_colld_cycle=1;
		this.player_colld_y=0;
	}	
	
	if (this.player_colld_magn && this.player_colld_cycle==2){
		if (Phaser.Point.distance(new Phaser.Point(triangle.x,triangle.y), coin_place, false)<16 && !this.player_colld){
			this.player_colld=1;

			}
	}

	//анимация приближения к игроку
	if (this.player_colld_magn){
		if (this.player_colld_cycle==1){
			if (this.player_colld_y>-66){
					this.player_colld_y+=(-72-this.player_colld_y)*.175;
					this.tmp_x+=(this.player_colld_x-this.tmp_x)*.075;
					this.magn.scale.x+=(0-this.magn.scale.x)*.2;
					this.magn.scale.y=this.magn.scale.x;
					
					this.pickedup_y=this.predef_y-triangle.y;
					this.pickedup_x=this.x-triangle.x;
			}else{
				this.player_colld_cycle=2;
				this.pickedup_y=this.predef_y-triangle.y;
				this.pickedup_x=this.x-triangle.x;
				if (this.pickedup_y>64){
					this.pickedup_y=64;
				}
			}	
			this.pickedup_y=this.predef_y-triangle.y;
			this.pickedup_x=this.x-triangle.x;
			this.y=this.pickedup_y+triangle.y+this.player_colld_y;
			this.x=this.pickedup_x+triangle.x+this.tmp_x;
			
			this.magn.y=this.y;
			this.magn.x=this.x;
		}else if (this.player_colld_cycle==2){
			if (!this.player_colld){
					this.pickedup_y+=(0-this.pickedup_y)*.35;
					this.pickedup_x+=(0-this.pickedup_x)*.35;

					this.y=this.pickedup_y+triangle.y;
					this.x=this.pickedup_x+triangle.x+this.tmp_x;
					this.magn.y=this.pickedup_y+triangle.y;
					this.magn.x=this.pickedup_x+triangle.x;
			}else{	
				//this.magn.z=19;
				if (this.create_eff){
					this.coineff = new CoinEff(game, triangle.x, triangle.y, this.type);
					this.create_eff=0;
					this.coin_effect(this.type);
				}
				this.y=triangle.y;
				this.x=triangle.x;
				this.magn.alpha=0;
			}		
			this.scale.x+=(0-this.scale.x)*.2;
			this.scale.y=this.scale.x;
		}
		
	}else{
		this.y=this.predef_y+this.idle_y; //idle-анимация
		this.magn.y=this.predef_y;
	}

	//удаление монет за экраном
	if (this.y>game.camera.y+1000){
		this.destroy();
	}
}	

Coin.prototype.coin_effect = function(type) {
	switch(type){
		case 'coin_yel':
			coins+=1;
			pre_coins+=1;
			temp_coins_Text.alpha=1;
			temp_coins_Text.scale=new Phaser.Point(1,1);
		break;
		
		case 'coin_or':
			coins+=2;
			pre_coins+=2;
			temp_coins_Text.alpha=1;
			temp_coins_Text.scale=new Phaser.Point(1,1);
		break;
		
		case 'coin_ice':
			ice=1;
			ice_timer=600;
			first_frame_ice=1;
			freeze_effect();
		break;
		
		case 'coin_red':
			player_r_shield=1;
			player_shield_opened=0;
			shield.tint=Phaser.Color.getColor(220, 62, 62);
		break;
		
		case 'coin_viol':
			player_v_shield=1;
			player_shield_opened=0;
			shield.tint=Phaser.Color.getColor(126, 46, 237);
		break;
		
	}
}