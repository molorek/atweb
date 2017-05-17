function player_preload(){
	game.load.image('skin','assets/skin_13.png');
	game.load.image('plshield','assets/coins/coin_magn.png');
}
console.log("player.js loaded");

function player_create(){
	triangle=player_group.create(0,0,'skin');
	triangle.width=32;
	triangle.height=32;
	//центрирование спрайта
	triangle.anchor.x=.5;
	triangle.anchor.y=.5;
	//позиционирование спрайта
	triangle.y=406.4+800;
	triangle.x=240;
	triangle.z=3;	
	
	//щит
	shield=player_group.create(0,0,'plshield');
	shield.anchor.x=.5;
	shield.anchor.y=.5;
	shield.scale=new Phaser.Point(0,0);
	shield.z=4;
	shield.x=triangle.x;
	shield.y=triangle.y;
	
	game.camera.follow(triangle);
	
	//управление
	var key1 = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR),
		key2 =  game.input.onTap.add(player_move, this);
    key1.onDown.add(player_move, this);
	
	//движение
	triangle.tr_y=0; //ограничитель движения вверх
	tr_up_times=0; //счетчик временных тапов
	triangle.hor_dir=0; //горизонтальное направление
	player_dead=0; //мертв ли треугольник

	//анимация смерти
	player_dead_cycle=0;
	player_dead_peak_sp=0;
	player_dead_fall_sp=0;
	player_dead_hsp=0;
	player_dead_timer=0;
	
	//щиты
	player_v_shield=0;
	player_r_shield=0;
	player_shield_scale=0;
	player_shield_opened=0;
	v_shield_y=1000;
	
}

function player_update(){
	
	if (!player_dead){
		///////////////вертикальное движение
		if (triangle.tr_y>=0){
			if (triangle.tr_y>0){
				triangle.tr_y-=6.4;
				triangle.y-=6.4;
				game.camera.y-=6.4;
				if ( tr_up_times!=0 && (triangle.tr_y<64*tr_up_times) ){
					tr_up_times-=1;
					if (triangle.hor_dir!=0){
						triangle.hor_dir=-triangle.hor_dir;
					}else{
						triangle.hor_dir=1;
					}
				}
			}
			if (triangle.tr_y==0){
				triangle.y=( game.math.roundTo(triangle.y/64, 0) )*64//game.math.snapTo(triangle.y, 64, 0);
				triangle.tr_y=-1;
			}
		}
		///////////////горизонтальное движение
		if (triangle.hor_dir>0){
			triangle.x+=player_spd;
			if (triangle.x>420){ //смерть от падения с угла стены
				triangle_corner_death(); //смерть от падения с угла стены
			}
		}else if (triangle.hor_dir<0){
			triangle.x-=player_spd;	
			if (triangle.x<60){ //смерть от падения с угла стены
				triangle_corner_death(); //смерть от падения с угла стены
			}	
		}
	}else{
		if (player_dead_timer>0){
			player_dead_timer-=1;
		}
		//ФИЗИКА ПАДЕНИЯ 
		if (player_dead_cycle==1){
			if (player_dead_peak_sp>0){
				player_dead_peak_sp-=.5; //уменьшаем скорость вертикального подъема
				triangle.y-=1+player_dead_peak_sp; //поднимаем треугольник
			}else{
				player_dead_cycle=2; //переходим на цикл падения
			}
		}else if (player_dead_cycle==2){
			player_dead_fall_sp+=.5; //увеличиваем скорость падения
			triangle.y+=2+player_dead_fall_sp; //опускаем треугольника
		}
		if (triangle.hor_dir>0){
			triangle.x+=player_dead_hsp;
			triangle.angle+=5;
		}else if (triangle.hor_dir<0){
			triangle.x-=player_dead_hsp;	
			triangle.angle-=5;
		}
	}
	
		//щиты
		if (player_r_shield || player_v_shield){
			shield.x=triangle.x;
			shield.y=triangle.y;
			shield.scale.x=player_shield_scale*.5;
			shield.scale.y=player_shield_scale*.5;
			
			if (!player_shield_opened){
				player_shield_open();
			}else{
				if (!player_dead){
					if (player_shield_scale>.45){
						player_shield_scale-=.001;
					}else{
						player_shield_destroy();
					}
				}else{
					player_shield_destroy();
				}
			}
		}else{
			shield.scale.x=0;
			shield.scale.y=0;
		}
	
}

function triangle_block_death(blck_dir){
	game.camera.follow(null);
	player_dead=1;
	player_dead_cycle=1;
	player_dead_peak_sp=9;
	player_dead_fall_sp=0;
	player_dead_timer=30;
	triangle.hor_dir=blck_dir;
	player_dead_hsp=7;
	
	ice=0;
}

function triangle_corner_death(){
	game.camera.follow(null);
	player_dead=1;
	player_dead_cycle=1;
	player_dead_peak_sp=7;
	player_dead_fall_sp=0;
	player_dead_timer=30;
	player_dead_hsp=4;
	
	ice=0;
}

function player_shield_open(){
	if (player_shield_scale<1 && !player_shield_opened){
		if (player_shield_scale<.95){
			player_shield_scale+=(1-player_shield_scale)*.25;
		}else{
			player_shield_scale=1;
			player_shield_opened=1;
		}
	}
}

function player_shield_destroy(){
	if (player_shield_scale>0 && (player_v_shield || player_r_shield)){
		if (player_v_shield){
			var coineff = new CoinEff(game, triangle.x, triangle.y, 'coin_viol');
			player_v_shield=0;
			//shield effect
			depth_group.forEach(function(tmp_block){
					if (tmp_block.y>(triangle.y-432)){
						if (!tmp_block.shield){
							tmp_block.shield=1;
							tmp_block.z=2;
						}
					}
			}, this);
		}else if (player_r_shield){
			var coineff = new CoinEff(game, triangle.x, triangle.y, 'coin_red');
			player_r_shield=0;
			//shield effect
			depth_group.forEach(function(tmp_block){
					if (tmp_block.y>(triangle.y-432)){
						if (!tmp_block.shield){
							tmp_block.death();
							tmp_block.z=2;
						}
					}
			}, this);
		}
		
		if (player_shield_scale>.1){
			player_shield_scale+=(0-player_shield_scale)*.4;
		}else{
			player_shield_scale=0;

		}
	}
}

function player_move(){
	if (!player_dead){
		if (!game_session_started){
			game_session_started=1;
		}
		if (triangle.tr_y<96){
			coin_timer-=1;
			score+=1;
			pre_score+=1;
			temp_score_Text.alpha=1;
			temp_score_Text.scale=new Phaser.Point(1,1);
			game_spd_score+=1;
			tr_up_times+=1;

			triangle.tr_y+=64;
			wall_timer-=1;
		}
	}
}