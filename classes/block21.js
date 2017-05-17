function block_preload(){
	game.load.image('block_spr','assets/block.png');
	game.load.spritesheet('block_anim', 'assets/block_animation_strip20.png', 196, 258, 20);
}
console.log("block.js loaded");

Block = function (game, x, y, dir) { 
	Phaser.Sprite.call(this, game, x, y, 'block_spr');
	depth_group.add(this);
	this.width=32;
	this.height=32;
	this.x=x;
	//this.y=game.math.snapTo(this.y, 64, 0);
	this.scale.x=-dir/2;
	this.dir=-dir;
	this.z=4;
	this.block_animated=0;
	this.player_colld=0;
	//������������� �������
	this.anchor.x=.5;
	this.anchor.y=.5;
	//��������
	this.currentframe=0;
	//�������� �������� ������������
	this.temp_r=255;
	this.temp_g=255
	this.temp_b=255;
	//������������
	this.shield=0;
	this.block_spd=0;
	this.v_shield_y=2000;
	//�������� ������
	this.dead=0;
	this.dead_cycle=0;
	this.dead_peak_sp=0;
	this.dead_fall_sp=0;
	this.dead_hsp=0;
	
	

};
   
Block.prototype = Object.create(Phaser.Sprite.prototype);
Block.prototype.constructor = Block;

Block.prototype.update = function() {
////
if (game_session_started){

	//�������� ������������
	var block_place=new Phaser.Point(this.x,this.y);
	if (player_r_shield){
		var tmp_sc=player_shield_scale*74;
		if (Phaser.Point.distance(new Phaser.Point(triangle.x,triangle.y), block_place, false)<tmp_sc && !this.player_colld){ //������� ���
			this.death();
			player_shield_scale-=.035;
		}
	}
	
	if (Phaser.Point.distance(new Phaser.Point(triangle.x,triangle.y), block_place, false)<32 && !this.player_colld){
		if (!player_v_shield){
			if (!this.shield){
				triangle_block_death(this.dir);
				this.player_colld=1;
			}else{
				this.death();
			}
		}else{
			this.shield=1;
			this.death();
			player_shield_destroy();
		}
	}
	
	//����������� ����� ����� �����, ���� �� ���� �����������
	if (this.player_colld){
		this.block_colld_color(183, 62, 62);
	}
	
	//���� �������� �� ���� ���
	if (this.shield){
		this.block_colld_color(126, 46, 237);
	}
	
	//�������������� ��������
	if (!this.block_animated){
		if (!this.shield){
			this.block_spd=block_spd;
			this.x+=this.block_spd*game.math.sign(this.dir);
		}else{
			if (this.block_spd>0){
				this.block_spd+=(-.1-this.block_spd)*.075;
				this.x+=this.block_spd*game.math.sign(this.dir);
			}else{
				this.block_spd=0;
			}
		}
	}
		
	//�������� ������� ������
	if (!this.dead && !this.shield){
		if (this.dir==1){	
			if (this.x>420){
				this.block_animation();
			}
		}else{
			if (this.x<60){
				this.block_animation();
			}	
		}	
	}
	
	//������ �����
	if (this.dead){
		this.death_animation();
	}
	
	//�������� ������ �� �������
	if (this.y>game.camera.y+1000){
		this.destroy();
	}
}
};

Block.prototype.death = function(){
	this.dead_cycle=1;
	this.dead_peak_sp=9;
	this.dead_fall_sp=0;
	this.dead_hsp=6;
	if (triangle.x>this.x){
		this.dir=-1;
	}else{
		this.dir=1;
	}
	this.death_animation();
	this.dead=1;
}

Block.prototype.death_animation = function(){
	//������ �����
	//������ ������� 
		if (this.dead_cycle==1){
			if (this.dead_peak_sp>0){
				this.dead_peak_sp-=.5; //��������� �������� ������������� �������
				this.y-=1+this.dead_peak_sp; //��������� �����������
			}else{
				this.dead_cycle=2; //��������� �� ���� �������
			}
		}else if (this.dead_cycle==2){
			this.dead_fall_sp+=.5; //����������� �������� �������
			this.y+=2+this.dead_fall_sp; //�������� ������������
		}
		if (this.dir>0){
			this.x+=this.dead_hsp;
			this.angle+=5;
		}else if (this.dir<0){
			this.x-=this.dead_hsp;	
			this.angle-=5;
		}
}

Block.prototype.block_colld_color = function(dest_r, dest_g, dest_b) {
	this.temp_r+=(dest_r-this.temp_r)*.25;
	this.temp_g+=(dest_g-this.temp_g)*.25;
	this.temp_b+=(dest_b-this.temp_b)*.25;

	this.tint=Phaser.Color.getColor(this.temp_r, this.temp_g, this.temp_b);
}

Block.prototype.block_animation = function() {
	if (!this.block_animated){
				//��������� ������ ��������
				this.loadTexture('block_anim', 0);
				//�������������� ������
				this.anchor.x=.3;
				this.anchor.y=.37;
				//������ ����������� �������
				this.scale.x=this.dir/2;
				//�������� ��������
				this.animations.add('jump_off');
				this.animations.play('jump_off', 60, false);
				this.block_animated=1;
			}else{
				this.currentframe = this.animations.currentAnim.frame;
				if (this.currentframe>=18){
					//������������� ��������
					this.animations.stop(null,true);  
					//��������� ������� �������� �����
					this.loadTexture('block_spr', 0);
					//�������������� ������
					this.anchor.x=.5;		
					this.anchor.y=.5;		
					//������ ���������������� �����
					this.y+=64;
					this.x+=30*game.math.sign(this.dir);	
					//������ �����������
					this.scale.x=-this.dir/2;
					this.dir=-this.dir;
					//�������� �� ��������� ��������
					this.block_animated=0;
				}
	}
}
