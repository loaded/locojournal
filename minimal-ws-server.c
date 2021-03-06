/*
 * lws-minimal-ws-server
 *
 * Written in 2010-2019 by Andy Green <andy@warmcat.com>
 *
 * This file is made available under the Creative Commons CC0 1.0
 * Universal Public Domain Dedication.
 *
 * This demonstrates the most minimal http server you can make with lws,
 * with an added websocket chat server.
 *
 * To keep it simple, it serves stuff in the subdirectory "./mount-origin" of
 * the directory it was started in.
 * You can change that by changing mount.origin.
 */

#include <libwebsockets.h>
#include <jpeglib.h>
#include <math.h>
#include <string.h>
#include <signal.h>
#include <jansson.h>
#include <errno.h>
#include <stdlib.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/time.h>
#include <sys/types.h>
#include <ogr_core.h>
#include <ogr_api.h>
#include <gdal.h>
#include <libpq-fe.h>
#include "gdp.h"
#include "structs.h"
#include "sha1.h"

#include <sys/stat.h>
#include <hiredis/hiredis.h>
#include <openssl/sha.h>
#include <openssl/rand.h>
#include <regex.h>
#include <limits.h>
#include <ctype.h>
#include <dirent.h>
#include <unistd.h>
#include <utime.h>
#define MAX_ERROR_MSG 7

static void
__minimal_destroy_message(void *_msg)
{
	struct msg *msg = _msg;

	free(msg->payload);
	msg->payload = NULL;
	msg->len = 0;
}



void do_exit(PGconn *conn){

	PQfinish(conn);
	exit(1);
}


static void __minimal_destroy_buffer(void *_incoming){


	struct incoming_data *incoming = _incoming ;

	free(incoming->buf);
	incoming->buf = NULL;
	incoming->len = 0;

	incoming->next = NULL;

}

static redisContext* redisc(){

	redisContext *c = redisConnect("localhost", 6379);
	if (c != NULL && c->err) {
	    printf("Error: %s\n", c->errstr);
	    // handle error
	} else {
	    printf("Connected to Redis\n");
	}


	return c;
}

static bool _SHA256(void* input, unsigned long length, unsigned char* md)
{

	
    SHA256_CTX context;
    if(!SHA256_Init(&context))
        return false;

    if(!SHA256_Update(&context, (unsigned char*)input, length))
        return false;

    if(!SHA256_Final(md, &context))
        return false;

    return true;
}

static int  getSession(char *cookie,char *user){

	redisContext *c = redisc();
	
	


	redisReply *reply;
	reply = redisCommand(c,"GET %s",cookie);
	
	
	
	snprintf(user,sizeof(reply->str),reply->str);


	freeReplyObject(reply);
	return 0;
}



static bool setSession(char* input){
	
	if(strlen(input) > 120) return false;
	redisContext *c = redisc();
	
	redisReply *reply;
	
	unsigned char session[SHA256_DIGEST_LENGTH + 1]; 


	char buff[120 - strlen(input)];
	char *mem = malloc(120);

	if(RAND_bytes(buff,sizeof(buff)) != 1) return false;
	
	memcpy(mem,strlen(input),input);
	memcpy(mem + strlen(input),120 -strlen(input),buff);

	
	_SHA256(mem,120,session);

	session[SHA256_DIGEST_LENGTH ] = '\0';		
	
	

	reply = redisCommand(c,"SET %s %s",input,session);
	freeReplyObject(reply);

	free(mem);		

	redisFree(c);

	return true;
	
}

static bool redis(char *key,char* value){

	redisContext *c = redisc();
	
	redisReply *reply;
	
	

	reply = redisCommand(c,"SET %s %s",key,value);

	
	freeReplyObject(reply);
	redisFree(c);
}



static  char* pasha(char* mess1,char * hex_tmp){

     EVP_MD_CTX *mdctx;
     const EVP_MD *md;
    
     unsigned char md_value[EVP_MAX_MD_SIZE ];

     unsigned int md_len, i;
	

     md = EVP_get_digestbyname("SHA256");
     if (md == NULL) {
         printf("Unknown message digest \n");
         
     }

     mdctx = EVP_MD_CTX_new();
     EVP_DigestInit_ex(mdctx, md, NULL);
     EVP_DigestUpdate(mdctx, mess1, strlen(mess1));
   
     EVP_DigestFinal_ex(mdctx, md_value, &md_len);
     EVP_MD_CTX_free(mdctx);


     for (i = 0; i < md_len; i++)  {
 
	  sprintf(&hex_tmp[i*2],"%02x", md_value[i]); 
     }


     return 0;
     
}



static int mcrypt(const char* title,const char* id,char*buff){


	int size = strlen(title) + strlen(id) + 1;

	char *icrypt = (char*)malloc(size);

	snprintf(icrypt,size,"%s%s",title,id);

	char hex_tmp[2* EVP_MAX_MD_SIZE + 1];

	pasha(icrypt,hex_tmp);
	snprintf(buff,20,hex_tmp);


	return  0;

}


static int create_video(struct per_session_data__minimal *pss,const char * filename){
	

		
		struct stat dir ={0};
		snprintf(pss->filename,strlen(filename) + 1,filename);
		//lws_filename_purify_inplace(pss->filename);
			
		const char * base = "www/files/";

	
		
		char *directorySize = strlen(base) + strlen(pss->mvideo->directory) + strlen(pss->id)  + 2;
		

		char *path = (char*)malloc(directorySize + strlen(filename) + 1);

		char *directory = (char*)malloc(directorySize);
		int n1 = snprintf(directory,directorySize,"%s%s/%s",base,pss->id,pss->mvideo->directory);	
		

		int n2 = snprintf(path,directorySize + strlen(filename) + 1,"%s/%s",directory,filename);	
		
		if(stat(directory,&dir) == -1){
			mkdir(directory,0777);
			printf("direectory is %s\n",directory);
		
			printf("creating directory \n");
		}
		

		pss->fd = lws_open(path,O_CREAT | O_TRUNC | O_RDWR ,0600);
		
		if(pss->fd == -1){
		
			lwsl_notice("failed to open file %s\n",path);
			free(path);
			return 1;
		}

		pss->start  = 0;

		free(path);
}



static int create_image(struct per_session_data__minimal *pss,const char * filename){
	

		
		struct stat dir ={0};
		snprintf(pss->filename,strlen(filename) + 1,filename);
		//lws_filename_purify_inplace(pss->filename);
			
		const char * base = "www/files/";

	
		
		char *directorySize = strlen(base) + strlen(pss->mgallery->directory) + strlen(pss->id)  + 2;
		

		char *path = (char*)malloc(directorySize + strlen(filename) + 1);

		char *directory = (char*)malloc(directorySize);
		int n1 = snprintf(directory,directorySize,"%s%s/%s",base,pss->id,pss->mgallery->directory);	
		

		int n2 = snprintf(path,directorySize + strlen(filename) + 1,"%s/%s",directory,filename);	
		
		if(stat(directory,&dir) == -1){
			mkdir(directory,0777);
			printf("direectory is %s\n",directory);
		
			printf("creating directory \n");
		}
		

		pss->fd = lws_open(path,O_CREAT | O_TRUNC | O_RDWR ,0600);
		
		if(pss->fd == -1){
		
			lwsl_notice("failed to open file %s\n",path);
			free(path);
			return 1;
		}

		pss->start  = 0;

		free(path);
}



static int create_file(struct per_session_data__minimal *pss,const char * filename){
	

		
		struct stat dir ={0};
		snprintf(pss->filename,strlen(filename) + 1,filename);
		//lws_filename_purify_inplace(pss->filename);
			
		const char * base = "www/files/";

	
		
		char *directorySize = strlen(base) + strlen(pss->mpload->directory) + strlen(pss->id)  + 2;
		

		char *path = (char*)malloc(directorySize + strlen(filename) + 1);

		char *directory = (char*)malloc(directorySize);
		int n1 = snprintf(directory,directorySize,"%s%s/%s",base,pss->id,pss->mpload->directory);	
		

		int n2 = snprintf(path,directorySize + strlen(filename) + 1,"%s/%s",directory,filename);	
		
		if(stat(directory,&dir) == -1){
			mkdir(directory,0777);
			printf("direectory is %s\n",directory);
		
			printf("creating directory \n");
		}
		

		pss->fd = lws_open(path,O_CREAT | O_TRUNC | O_RDWR ,0600);
		
		if(pss->fd == -1){
		
			lwsl_notice("failed to open file %s\n",path);
			free(path);
			return 1;
		}
	

		
		pss->start  = 0;

		free(path);
		free(directory);
}



static int get_hash_location(struct per_vhost_data__minimal *vhd,struct lws *wsi,struct per_session_data__minimal *pss,json_t *root){

	json_t *_xm = json_object_get(root,"xmin");
	json_t *_ym = json_object_get(root,"ymin");

	json_t *_xma = json_object_get(root,"xmax");
	json_t *_yma = json_object_get(root,"ymax");


	float xmin = (float) json_real_value(_xm);
	float ymin = (float) json_real_value(_ym);

	float xmax = (float)json_real_value(_xma);
	float ymax = (float)json_real_value(_yma);

	PGconn *conn = 	PQconnectdb("user=loco dbname=loco");
	PGresult *res;


	if(PQstatus(conn) == CONNECTION_BAD){
		fprintf(stderr,"connection to databas failed : %s\n",
				PQerrorMessage(conn));

		do_exit(conn);
	}


	char bufferX[64];
	char bufferY[64];
	char bufferXM[64];
	char bufferYM[64];
	
	int _xmin = snprintf(bufferX,sizeof(bufferX),"%f",xmin);
	int _ymin = snprintf(bufferY,sizeof(bufferY),"%f",ymin);
	int _xmax = snprintf(bufferXM,sizeof(bufferXM),"%f",xmax);
	int _ymax = snprintf(bufferYM,sizeof(bufferYM),"%f",ymax);

	if(_xmin > sizeof(bufferX) || _ymin > sizeof(bufferY) ) do_exit(conn);
	if(_xmax > sizeof(bufferXM) || _ymax > sizeof(bufferYM)) do_exit(conn);

	const char *paramValues[4];
	
	paramValues[0] =  bufferX;
	paramValues[1] =  bufferY;
	paramValues[2] = bufferXM;
	paramValues[3] = bufferYM;
		
	res = PQexecParams(conn,
		"SELECT id , ST_AsEWKT(geom) , title   FROM details  WHERE details.geom && ST_MakeEnvelope($1, $2,$3, $4)",	
			4,
			NULL,
			paramValues,
			NULL,
			NULL,
			1);


	if(PQresultStatus(res) != PGRES_TUPLES_OK){
		lwsl_user("%s : \n",PQresultErrorMessage(res));
	
		PQclear(res);
		do_exit(conn);
	}
	

	int rows = PQntuples(res);
	json_t *response = json_object();
	json_t *arr = json_array();
	json_object_set(response,"data",arr);
	json_object_set(response,"route",json_string("home--mapmove"));	
	json_object_set(response,"size",json_integer(rows));

	 GDALAllRegister();
	for(int i = 0 ; i < rows ; i++){
		
		OGRGeometryH geometry ; 
		char* wkt =(char*) PQgetvalue(res,i,1);

		
		json_t* child = json_object();

		OGR_G_CreateFromWkt(&wkt,NULL,&geometry);

		
		json_object_set(child,"id",json_string((const char*)PQgetvalue(res,i,0)));
		json_object_set(child,"x",json_real(OGR_G_GetX(geometry,0)));
		json_object_set(child,"y",json_real(OGR_G_GetY(geometry,0)));		
		json_object_set(child,"title",json_string((const char*)PQgetvalue(res,i,2)));	
		get_urls(PQgetvalue(res,i,0),child);	
		json_array_append(arr,child);

	}



	PQclear(res);
	PQfinish(conn);
	send_to_ws(vhd,wsi,json_dumps(response,0));

	
	json_decref(response);
	//int m = lws_write(wsi, ((unsigned char *)output) +
	//		      LWS_PRE, strlen(json), LWS_WRITE_TEXT);

	
}
int getThumb(PGconn *conn,const char* id,json_t *response){

	PGresult *res;

	char bufferX[64];

	int retX = snprintf(bufferX,sizeof(bufferX),"%s",id);

	if(retX > sizeof(bufferX)) do_exit(conn);
	const char *paramValue[1] ;
	paramValue[0] = (const char*) bufferX;
	res = PQexecParams(conn,
			"select url from urls where id=$1 limit 1",
			1,
			NULL,
			paramValue,
			NULL,
			NULL,
			1);
	



	if(PQresultStatus(res) != PGRES_TUPLES_OK){
		fprintf(stderr, "SELECT failed: %s", PQerrorMessage(conn));
		
		PQclear(res);
		do_exit(conn);
	}
	


	
	json_object_set(response,"url",json_string((char *)PQgetvalue(res,0,0)));

		return 0;



}
static int get_video_model(struct per_vhost_data__minimal *vhd,struct lws *wsi,struct per_session_data__minimal *pss,json_t *root){
	
	const char* id = json_string_value(json_object_get(root,"id"));

	PGconn *conn = 	PQconnectdb("user=loco dbname=loco");
	PGresult *res;


	if(PQstatus(conn) == CONNECTION_BAD){
		fprintf(stderr,"connection to databas failed : %s\n",
				PQerrorMessage(conn));

		do_exit(conn);
	}


	
	char bufferX[64];

	int retX = snprintf(bufferX,sizeof(bufferX),"%s",id);

	if(retX > sizeof(bufferX)) do_exit(conn);
	const char *paramValue[1] ;
	paramValue[0] = (const char*) bufferX;



	res = PQexecParams(conn,
		"SELECT id , ST_AsEWKT(location) ,description, title , username  FROM video  WHERE id=$1",	
			1,
			NULL,
			paramValue,
			NULL,
			NULL,
			1);


	if(PQresultStatus(res) != PGRES_TUPLES_OK){
		lwsl_user("%s : \n",PQresultErrorMessage(res));
	
		PQclear(res);
		do_exit(conn);
	}
	
	GDALAllRegister();

	json_t *response = json_object();
	
	OGRGeometryH geometry ; 
	char* wkt =(char*) PQgetvalue(res,0,1);

	


	OGR_G_CreateFromWkt(&wkt,NULL,&geometry);

	
	json_object_set(response,"id",json_string((const char*)PQgetvalue(res,0,0)));
	json_object_set(response,"x",json_real(OGR_G_GetX(geometry,0)));
	json_object_set(response,"y",json_real(OGR_G_GetY(geometry,0)));		
	json_object_set(response,"title",json_string((const char*)PQgetvalue(res,0,3)));	
	json_object_set(response,"description",json_string((const char*)PQgetvalue(res,0,2)));
	json_object_set(response,"username",json_string((const char*)PQgetvalue(res,0,4)));
	json_object_set(response,"route",json_string("play--video"));
	getThumb(conn,id,response);

	PQclear(res);
	PQfinish(conn);
	send_to_ws(vhd,wsi,json_dumps(response,0));

	
	json_decref(response);



}

static int get_video_bound(PGconn * conn,const char* paramValues,json_t * arr){
	

	PGresult *res;

	res = PQexecParams(conn,
		"SELECT id , ST_AsEWKT(location) ,description, title , username  FROM video  WHERE video.location && ST_MakeEnvelope($1, $2,$3, $4)",	
			4,
			NULL,
			paramValues,
			NULL,
			NULL,
			1);


	if(PQresultStatus(res) != PGRES_TUPLES_OK){
		lwsl_user("%s : \n",PQresultErrorMessage(res));
	
		PQclear(res);
		do_exit(conn);
	}
	

	int rows = PQntuples(res);
	

	GDALAllRegister();
	for(int i = 0 ; i < rows ; i++){
		
		OGRGeometryH geometry ; 
		char* wkt =(char*) PQgetvalue(res,i,1);

		
		json_t* child = json_object();

		OGR_G_CreateFromWkt(&wkt,NULL,&geometry);


		json_object_set(child,"id",json_string((const char*)PQgetvalue(res,i,0)));
		json_object_set(child,"x",json_real(OGR_G_GetX(geometry,0)));
		json_object_set(child,"y",json_real(OGR_G_GetY(geometry,0)));		
		json_object_set(child,"title",json_string((const char*)PQgetvalue(res,i,3)));	
		json_object_set(child,"description",json_string((const char*)PQgetvalue(res,i,2)));
		json_object_set(child,"username",json_string((const char*)PQgetvalue(res,i,4)));
		getThumb(conn,PQgetvalue(res,i,0),child);
		

		
		json_object_set(child,"type",json_string("video"));	
		
		json_array_append(arr,child);

	}
	
	PQclear(res);

}
static int get_article_bound(PGconn *conn,const char* paramValues,json_t *arr){
	PGresult *res;

	res = PQexecParams(conn,
		"SELECT id , ST_AsEWKT(location) ,description, header  ,username FROM article  WHERE article.location && ST_MakeEnvelope($1, $2,$3, $4)",	
			4,
			NULL,
			paramValues,
			NULL,
			NULL,
			1);


	if(PQresultStatus(res) != PGRES_TUPLES_OK){
		lwsl_user("%s : \n",PQresultErrorMessage(res));
	
		PQclear(res);
		do_exit(conn);
	}
	

	int rows = PQntuples(res);

	GDALAllRegister();
	for(int i = 0 ; i < rows ; i++){
		
		OGRGeometryH geometry ; 
		char* wkt =(char*) PQgetvalue(res,i,1);

		
		json_t* child = json_object();

		OGR_G_CreateFromWkt(&wkt,NULL,&geometry);

		
		json_object_set(child,"id",json_string((const char*)PQgetvalue(res,i,0)));
		json_object_set(child,"x",json_real(OGR_G_GetX(geometry,0)));
		json_object_set(child,"y",json_real(OGR_G_GetY(geometry,0)));		
		json_object_set(child,"header",json_string((const char*)PQgetvalue(res,i,3)));	
		json_object_set(child,"description",json_string((const char*)PQgetvalue(res,i,2)));	
		json_object_set(child,"username",json_string((const char*)PQgetvalue(res,i,4)));	
		json_object_set(child,"type",json_string("article"));	
		getThumb(conn,(const char*)PQgetvalue(res,i,0),child);		

		
		json_array_append(arr,child);

	}
	
	PQclear(res);


}
static int get_gallery_bound(PGconn *conn,const char* paramValues,json_t *arr){
	PGresult *res;
	res = PQexecParams(conn,
		"SELECT id , ST_AsEWKT(location),description , title ,username  FROM gallery  WHERE gallery.location && ST_MakeEnvelope($1, $2,$3, $4)",	
			4,
			NULL,
			paramValues,
			NULL,
			NULL,
			1);


	if(PQresultStatus(res) != PGRES_TUPLES_OK){
		lwsl_user("%s : \n",PQresultErrorMessage(res));
	
		PQclear(res);
		do_exit(conn);
	}
	

	int rows = PQntuples(res);

	GDALAllRegister();
	for(int i = 0 ; i < rows ; i++){
		
		OGRGeometryH geometry ; 
		char* wkt =(char*) PQgetvalue(res,i,1);

		
		json_t* child = json_object();

		OGR_G_CreateFromWkt(&wkt,NULL,&geometry);

			
		json_object_set(child,"id",json_string((const char*)PQgetvalue(res,i,0)));
		json_object_set(child,"x",json_real(OGR_G_GetX(geometry,0)));
		json_object_set(child,"y",json_real(OGR_G_GetY(geometry,0)));		
		json_object_set(child,"title",json_string((const char*)PQgetvalue(res,i,3)));	
		json_object_set(child,"description",json_string((const char*)PQgetvalue(res,i,2)));	
		json_object_set(child,"username",json_string((const char*)PQgetvalue(res,i,4)));	
		
		json_object_set(child,"type",json_string("gallery"));	
		
		getThumb(conn,(const char*)PQgetvalue(res,i,0),child);		
		json_array_append(arr,child);

	}

	PQclear(res);

}



static int get_data_location(struct per_vhost_data__minimal *vhd,struct lws *wsi,struct per_session_data__minimal *pss,json_t *root){

	json_t *_xm = json_object_get(root,"xmin");
	json_t *_ym = json_object_get(root,"ymin");

	json_t *_xma = json_object_get(root,"xmax");
	json_t *_yma = json_object_get(root,"ymax");


	float xmin = (float) json_real_value(_xm);
	float ymin = (float) json_real_value(_ym);

	float xmax = (float)json_real_value(_xma);
	float ymax = (float)json_real_value(_yma);

	PGconn *conn = 	PQconnectdb("user=loco dbname=loco");
	PGresult *res;


	if(PQstatus(conn) == CONNECTION_BAD){
		fprintf(stderr,"connection to databas failed : %s\n",
				PQerrorMessage(conn));

		do_exit(conn);
	}


	char bufferX[64];
	char bufferY[64];
	char bufferXM[64];
	char bufferYM[64];
	
	int _xmin = snprintf(bufferX,sizeof(bufferX),"%f",xmin);
	int _ymin = snprintf(bufferY,sizeof(bufferY),"%f",ymin);
	int _xmax = snprintf(bufferXM,sizeof(bufferXM),"%f",xmax);
	int _ymax = snprintf(bufferYM,sizeof(bufferYM),"%f",ymax);

	if(_xmin > sizeof(bufferX) || _ymin > sizeof(bufferY) ) do_exit(conn);
	if(_xmax > sizeof(bufferXM) || _ymax > sizeof(bufferYM)) do_exit(conn);

	const char *paramValues[4];
	
	paramValues[0] =  bufferX;
	paramValues[1] =  bufferY;
	paramValues[2] = bufferXM;
	paramValues[3] = bufferYM;


	json_t *response = json_object();
	json_t *arr = json_array();
	json_object_set(response,"data",arr);
	json_object_set(response,"route",json_string("home--mapmove"));	
	

	get_video_bound(conn,paramValues,arr);
	get_article_bound(conn,paramValues,arr);
	get_gallery_bound(conn,paramValues,arr);

	PQfinish(conn);
	send_to_ws(vhd,wsi,json_dumps(response,0));

	
	json_decref(response);
	//int m = lws_write(wsi, ((unsigned char *)output) +
	//		      LWS_PRE, strlen(json), LWS_WRITE_TEXT);

	
}



static int prepare_edit(struct per_vhost_data__minimal *vhd,struct lws *wsi,struct per_session_data__minimal *pss,json_t *root){
	

/*

	int nFiles = (int) json_number_value(json_object_get(root,"nfile"));
	char *hash = json_string_value(json_object_get(root,"hash"));
	char *title = json_string_value(json_object_get(root,"title"));


	const char *cookie = json_string_value(json_object_get(root,"cookie"));
	
	pss->mpload =(struct upload *) malloc(sizeof(struct upload));

	pss->mpload->names = list_init();

	char *hashcode[21];
	char *user[20];


	snprintf(hashcode,20,cookie);

	getSession(hashcode,user);



	snprintf(pss->id,strlen(user)+1,user);	
	
	

	pss->mpload->nFiles = nFiles;	

	snprintf(pss->mpload->title , strlen(title) + 1,title);

	snprintf(pss->mpload->hash , strlen(hash)+1,hash);	

	pss->mpload->edit = 1;
	
	pss->mpload->uploaded = 0;
	

*/
	return 0;

}

static int get_article(struct per_vhost_data__minimal *vhd,struct lws *wsi,struct per_session_data__minimal *pss,json_t *root){

	char* id = json_string_value(json_object_get(root,"id"));

	PGconn *conn = PQconnectdb("user=loco dbname=loco");
	PGresult *res;

	if(PQstatus(conn) == CONNECTION_BAD){
	
		fprintf(stderr,"connection to database failed : %s\n",PQerrorMessage(conn));
		do_exit(conn);
	}


	
	char bufferX[64];

	int retX = snprintf(bufferX,sizeof(bufferX),"%s",id);

	if(retX > sizeof(bufferX)) do_exit(conn);


	const char *paramValue[1] ;
	paramValue[0] = (const char*) bufferX;
	res = PQexecParams(conn,
			"select  ST_AsEWKT(location)   from  article where id=$1",
			1,
			NULL,
			paramValue,
			NULL,
			NULL,
			1);
	

	if(PQresultStatus(res) != PGRES_TUPLES_OK){
		fprintf(stderr, "SELECT failed: %s", PQerrorMessage(conn));

		PQclear(res);
		do_exit(conn);
	}

	int rows = PQntuples(res);
	
	
	json_t *response = json_object();
	json_t *arr = json_array();


	json_object_set(response,"tags",arr);
	json_object_set(response,"route",json_string("article--init"));

	
	OGRGeometryH geometry ; 
	char* wkt =(char*) PQgetvalue(res,0,0);


	OGR_G_CreateFromWkt(&wkt,NULL,&geometry);


	json_object_set(response,"id",json_string(id));	
	json_object_set(response,"x",json_real(OGR_G_GetX(geometry,0)));
	json_object_set(response,"y",json_real(OGR_G_GetY(geometry,0)));
	
	gettags(id,arr,conn);

	PQclear(res);
	PQfinish(conn);

	//get_sur_name(username,response);
	send_to_ws(vhd,wsi,json_dumps(response,0));

	
	json_decref(response);
       	//int m = lws_write(wsi, ((unsigned char *)output) +
	//		      LWS_PRE, strlen(json), LWS_WRITE_TEXT);


	
}

static int prepare_video(struct per_vhost_data__minimal *vhd,struct lws *wsi,struct per_session_data__minimal *pss,json_t *root){



	json_t *jwidth = json_object_get(root,"x");
	json_t *jheight = json_object_get(root,"y");
	json_t * jtitle = json_object_get(root,"title");
	json_t *jnfiles = json_object_get(root,"nfile"); 	
	json_t *jdescription = json_object_get(root,"description");

	float x = (float) json_real_value(jwidth);
	float y = (float) json_real_value(jheight);
	int nFiles = (int) json_number_value(jnfiles);
	const char *title = json_string_value(jtitle);
	const char * description = json_string_value(jdescription);



	//const char *cookie = json_string_value(json_object_get(root,"hash"));
	
	pss->mvideo =(struct video *) malloc(sizeof(struct video));

	pss->mvideo->names = list_init();
	pss->mvideo->tags = list_init();
	/*
	char *hash[21];
	char *user[20];


	snprintf(hash,20,cookie);

	getSession(hash,user);
*/



	
	json_t *arr = json_object_get(root,"tags");
    	

	int ar_size = json_array_size(arr);
	 int counter ;

	

	 printf("j tag length is %d\n",ar_size);


	char *tag;
	for( counter = 0 ; counter < ar_size ; counter++){
		json_t *jtag;

		jtag = json_array_get(arr,counter);

		tag = json_string_value(jtag);
		
		list_add(pss->mvideo->tags,tag,strlen(tag)+1);
		

		

		printf("tag  is %s\n",tag);
		tag  = NULL;
	
	}




	char *user = "naro";

	 snprintf(pss->mvideo->title,strlen(title) +1,title);

	snprintf(pss->mvideo->description,strlen(description)+1,description);
	snprintf(pss->id,strlen(user)+1,user);	
	

	pss->mvideo->x = x;
	pss->mvideo->y = y;

	pss->mvideo->nFiles = nFiles;
	char cypt[20];	
	

	
	mcrypt(pss->mvideo->title,user,cypt);
	
	printf("cypt is %s\n",cypt);

	printf("before directory encyrpt \n");
	snprintf(pss->mvideo->directory,strlen(cypt)+1 ,cypt) ;	
	pss->mvideo->edit = 0;;
	pss->mvideo->uploaded = 0;
	printf("after directory printf\n");
	return 0;
	
}


static int prepare_gallery(struct per_vhost_data__minimal *vhd,struct lws *wsi,struct per_session_data__minimal *pss,json_t *root){



	json_t *jwidth = json_object_get(root,"x");
	json_t *jheight = json_object_get(root,"y");
	json_t * jtitle = json_object_get(root,"title");
	json_t *jnfiles = json_object_get(root,"nfile"); 	
	json_t *jdescription = json_object_get(root,"description");

	float x = (float) json_real_value(jwidth);
	float y = (float) json_real_value(jheight);
	int nFiles = (int) json_number_value(jnfiles);
	const char *title = json_string_value(jtitle);
	const char * description = json_string_value(jdescription);



	//const char *cookie = json_string_value(json_object_get(root,"hash"));
	
	pss->mgallery =(struct gallery *) malloc(sizeof(struct gallery));

	pss->mgallery->names = list_init();
	pss->mgallery->tags = list_init();
	/*
	char *hash[21];
	char *user[20];


	snprintf(hash,20,cookie);

	getSession(hash,user);
*/



	
	json_t *arr = json_object_get(root,"tags");
    	

	int ar_size = json_array_size(arr);
	 int counter ;

	

	 printf("j tag length is %d\n",ar_size);


	char *tag;
	for( counter = 0 ; counter < ar_size ; counter++){
		json_t *jtag;

		jtag = json_array_get(arr,counter);

		tag = json_string_value(jtag);
		
		list_add(pss->mgallery->tags,tag,strlen(tag)+1);
		

		

		printf("tag  is %s\n",tag);
		tag  = NULL;
	
	}




	char *user = "naro";

	 snprintf(pss->mgallery->title,strlen(title) +1,title);

	snprintf(pss->mgallery->description,strlen(description)+1,description);
	snprintf(pss->id,strlen(user)+1,user);	
	

	pss->mgallery->x = x;
	pss->mgallery->y = y;

	pss->mgallery->nFiles = nFiles;
	char cypt[20];	
	

	
	mcrypt(pss->mgallery->title,user,cypt);
	
	printf("cypt is %s\n",cypt);

	printf("before directory encyrpt \n");
	snprintf(pss->mgallery->directory,strlen(cypt)+1 ,cypt) ;	
	pss->mgallery->edit = 0;;
	pss->mgallery->uploaded = 0;
	printf("after directory printf\n");
	return 0;
	
}



static int prepare_upload(struct per_vhost_data__minimal *vhd,struct lws *wsi,struct per_session_data__minimal *pss,json_t *root){



	json_t *jwidth = json_object_get(root,"x");
	json_t *jheight = json_object_get(root,"y");
	json_t * jheader = json_object_get(root,"header");
	json_t *jnfiles = json_object_get(root,"nfile"); 	
	json_t *jdescription = json_object_get(root,"description");
	




	float x = (float) json_real_value(jwidth);
	float y = (float) json_real_value(jheight);
	int nFiles = (int) json_number_value(jnfiles);
	const char *header = json_string_value(jheader);
	const char * description = json_string_value(jdescription);



	//const char *cookie = json_string_value(json_object_get(root,"hash"));
	
	pss->mpload =(struct upload *) malloc(sizeof(struct upload));

	pss->mpload->names = list_init();
	pss->mpload->tags = list_init();
	/*
	char *hash[21];
	char *user[20];


	snprintf(hash,20,cookie);

	getSession(hash,user);
*/



	
	json_t *arr = json_object_get(root,"tags");
    	

	int ar_size = json_array_size(arr);
	 int counter ;

	

	 printf("j tag length is %d\n",ar_size);


	char *tag;
	for( counter = 0 ; counter < ar_size ; counter++){
		json_t *jtag;

		jtag = json_array_get(arr,counter);

		tag = json_string_value(jtag);
		
		list_add(pss->mpload->tags,tag,strlen(tag)+1);
		

		

		printf("tag  is %s\n",tag);
		tag  = NULL;
	
	}

	char *user = "naro";

	 snprintf(pss->mpload->header,strlen(header) +1,header);

	snprintf(pss->mpload->description,strlen(description)+1,description);
	snprintf(pss->id,strlen(user)+1,user);	

	pss->mpload->x = x;
	pss->mpload->y = y;

	pss->mpload->nFiles = nFiles;
	char cypt[20];	
	
	mcrypt(pss->mpload->header,user,cypt);
	
	printf("cypt is %s\n",cypt);

	printf("before directory encyrpt \n");
	snprintf(pss->mpload->directory,strlen(cypt)+1 ,cypt) ;	
	pss->mpload->edit = 0;;
	pss->mpload->uploaded = 0;
	printf("after directory printf\n");
	return 0;
	
}



static int update_location(json_t *root,PGconn *conn){

	const char *username = json_string_value(json_object_get(root,"user"));
	const char  *hash = json_string_value(json_object_get(root,"hash"));


	float x = (float) json_real_value(json_object_get(root,"x"));
	float y = (float) json_real_value(json_object_get(root,"y"));


	char bufferX[64];
	char bufferY[64];

	int retX = snprintf(bufferX,sizeof(bufferX),"%f",x);
	int retY = snprintf(bufferY,sizeof(bufferY),"%f",y);

	if(retX > sizeof(bufferX) || retY > sizeof(bufferY) ) do_exit(conn);


	PGresult *res;

	const char *paramValues[3];

	paramValues[0] =  bufferX;
	paramValues[1] =  bufferY;
	paramValues[2] = hash;
	paramValues[3] = username;


	res = PQexecParams(conn,
			"update  ihash set geom=ST_MakePoint($1,$2) where hash=$3 and username=$4",
			4,
			NULL,
			paramValues,
			NULL,
			NULL,
			1);


	if(PQresultStatus(res) != PGRES_COMMAND_OK){
		PQclear(res);
		do_exit(conn);
	}

	PQclear(res);
	
	return 0;
}



int gallery_image(struct per_session_data__minimal *pss,char* filename){

			


		//lws_filename_purify_inplace(pss->filename);
			
		const char * base = "www/files/";

		int size = strlen(base)+strlen(pss->id) + strlen(pss->mgallery->directory) + strlen(filename) + 3;
		
		char *path = (char *)malloc(size);
	
		int n1 = snprintf(path,size,"%s%s/%s/%s",base,pss->id,pss->mgallery->directory,filename);
		

		process_it(path);
	
}


int handle_image(struct per_session_data__minimal *pss,char* filename){

			


		//lws_filename_purify_inplace(pss->filename);
			
		const char * base = "www/files/";

		int size = strlen(base)+strlen(pss->id) + strlen(pss->mpload->directory) + strlen(filename) + 3;
		
		char *path = (char *)malloc(size);
	
		int n1 = snprintf(path,size,"%s%s/%s/%s",base,pss->id,pss->mpload->directory,filename);
		

		process_it(path);
	
}
static int add_video_location(struct per_vhost_data__minimal *vhd,struct lws *wsi,
		struct per_session_data__minimal *pss){

	
	float x = pss->mvideo->x;
	float y = pss->mvideo->y;
	
	printf("x and y is %f %f \n",x,y);
	printf("pss x and y is %f %f \n",pss->mvideo->x,pss->mvideo->y);
	const char *title = pss->mvideo->title;
	int nFiles = pss->mvideo->nFiles;
	const char *description = pss->mvideo->description;	
	


	list_iter_t* iter = list_iter_first(pss->mvideo->names);
	

	PGconn *conn = 	PQconnectdb("user=loco dbname=loco");
	PGresult *res,*res1, *res2;
	if(PQstatus(conn) == CONNECTION_BAD){
		fprintf(stderr,"connection to database failed : %s\n",
				PQerrorMessage(conn));

		do_exit(conn);
	}
	char bufferX[64];
	char bufferY[64];
	char bufferP[64];

	int retX = snprintf(bufferX,sizeof(bufferX),"%f",x);
	int retY = snprintf(bufferY,sizeof(bufferY),"%f",y);



	if(retX > sizeof(bufferX) || retY > sizeof(bufferY) ) do_exit(conn);

	const char *paramValues[6];
	
	char cypt[20];
	mcrypt(title,pss->id,cypt);

	printf("before connection\n");


	paramValues[0] =  bufferX;
	paramValues[1] =  bufferY;
	paramValues[2] = (char*)title;
	paramValues[3] =(const char*) cypt;
	paramValues[4] = description;
	paramValues[5] =(const char*)pss->id;


	printf("printfing paramVAlues\n");

	printf("%s\n",paramValues[0]);
	printf("%s\n",paramValues[1]);

	printf("%s\n",paramValues[2]);
	printf("%s\n",paramValues[3]);
	printf("%s\n",paramValues[4]);
	printf("%s\n",paramValues[5]);
//	printf("%d\n",paramValues[6]);
	
	printf("done\n");

	res = PQexecParams(conn,
			"insert into video (location,title,id,description,username) values (ST_MakePoint($1,$2),$3,$4,$5,$6)",
			6,
			NULL,
			paramValues,
			NULL,
			NULL,
			1);


	if(PQresultStatus(res) != PGRES_COMMAND_OK){
			printf("this is error\n");
	
		fprintf(stderr, "SELECT failed: %s", PQerrorMessage(conn));



		PQclear(res);
		do_exit(conn);
	}

	PQclear(res);
	const char *urlParam[3];
	

	mcrypt(title,pss->id,cypt);
	
	do {
		urlParam[0] = list_iter_get_value(iter);
		urlParam[1] = cypt;
		urlParam[2] = pss->id;

		printf("url is %s\n",urlParam[0]);
		res1 = PQexecParams(conn,
			"insert into urls (url,id,username) values ($1,$2,$3)",
			3,
			NULL,
			urlParam,
			NULL,
			NULL,
			1);

		if(PQresultStatus(res1) != PGRES_COMMAND_OK){
			PQclear(res1);
			do_exit(conn);
		}

		PQclear(res1);



	}while(iter = list_iter_next(iter));


	const char* tagParam[4];
	printf("start of tags\n");
	list_iter_t* titer = list_iter_first(pss->mvideo->tags);
	printf("1\n");


	do {
		tagParam[0] = list_iter_get_value(titer);
		tagParam[1] =cypt;

		tagParam[2] = bufferX;
		tagParam[3] = bufferY;
		
		printf("tag is %s\n",tagParam[0]);

		res2 = PQexecParams(conn,
			"insert into tags (tag,id,location) values ($1,$2,ST_MakePoint($3,$4))",
			4,
			NULL,
			tagParam,
			NULL,
			NULL,
			1);

		if(PQresultStatus(res2) != PGRES_COMMAND_OK){
			fprintf(stderr, "SELECT failed: %s", PQerrorMessage(conn));

			PQclear(res2);
			do_exit(conn);
		}

		PQclear(res2);



	}while(titer = list_iter_next(titer));




	PQfinish(conn);

		
	json_t *response = json_object();

	json_object_set(response,"route",json_string("video-done"));
	
	json_object_set(response,"id",json_string(paramValues[3]));

	send_to_ws(vhd,wsi,json_dumps(response,0));

	
	json_decref(response);
       	//int m = lws_write(wsi, ((unsigned char *)output) +
	//		      LWS_PRE, strlen(json), LWS_WRITE_TEXT);


	return 0;

 }


static int add_gallery_location(struct per_vhost_data__minimal *vhd,struct lws *wsi,
		struct per_session_data__minimal *pss){

	
	float x = pss->mgallery->x;
	float y = pss->mgallery->y;
	
	printf("x and y is %f %f \n",x,y);
	printf("pss x and y is %f %f \n",pss->mgallery->x,pss->mgallery->y);
	const char *title = pss->mgallery->title;
	int nFiles = pss->mgallery->nFiles;
	const char *description = pss->mgallery->description;	
	


	list_iter_t* iter = list_iter_first(pss->mgallery->names);
	

	PGconn *conn = 	PQconnectdb("user=loco dbname=loco");
	PGresult *res,*res1, *res2;
	if(PQstatus(conn) == CONNECTION_BAD){
		fprintf(stderr,"connection to database failed : %s\n",
				PQerrorMessage(conn));

		do_exit(conn);
	}
	char bufferX[64];
	char bufferY[64];
	char bufferP[64];

	int retX = snprintf(bufferX,sizeof(bufferX),"%f",x);
	int retY = snprintf(bufferY,sizeof(bufferY),"%f",y);



	if(retX > sizeof(bufferX) || retY > sizeof(bufferY) ) do_exit(conn);

	const char *paramValues[6];
	
	char cypt[20];
	mcrypt(title,pss->id,cypt);

	printf("before connection\n");


	paramValues[0] =  bufferX;
	paramValues[1] =  bufferY;
	paramValues[2] = (char*)title;
	paramValues[3] =(const char*) cypt;
	paramValues[4] = description;
	paramValues[5] =(const char*)pss->id;


	printf("printfing paramVAlues\n");

	printf("%s\n",paramValues[0]);
	printf("%s\n",paramValues[1]);

	printf("%s\n",paramValues[2]);
	printf("%s\n",paramValues[3]);
	printf("%s\n",paramValues[4]);
	printf("%s\n",paramValues[5]);
//	printf("%d\n",paramValues[6]);
	
	printf("done\n");

	res = PQexecParams(conn,
			"insert into gallery (location,title,id,description,username) values (ST_MakePoint($1,$2),$3,$4,$5,$6)",
			6,
			NULL,
			paramValues,
			NULL,
			NULL,
			1);


	if(PQresultStatus(res) != PGRES_COMMAND_OK){
			printf("this is error\n");
	
		fprintf(stderr, "SELECT failed: %s", PQerrorMessage(conn));



		PQclear(res);
		do_exit(conn);
	}

	PQclear(res);
	const char *urlParam[3];
	

	mcrypt(title,pss->id,cypt);
	
	do {
		urlParam[0] = list_iter_get_value(iter);
		urlParam[1] = cypt;
		urlParam[2] = pss->id;

		printf("url is %s\n",urlParam[0]);
		res1 = PQexecParams(conn,
			"insert into urls (url,id,username) values ($1,$2,$3)",
			3,
			NULL,
			urlParam,
			NULL,
			NULL,
			1);

		if(PQresultStatus(res1) != PGRES_COMMAND_OK){
			PQclear(res1);
			do_exit(conn);
		}

		PQclear(res1);



	}while(iter = list_iter_next(iter));


	const char* tagParam[4];
	printf("start of tags\n");
	list_iter_t* titer = list_iter_first(pss->mgallery->tags);
	printf("1\n");


	do {
		tagParam[0] = list_iter_get_value(titer);
		tagParam[1] =cypt;

		tagParam[2] = bufferX;
		tagParam[3] = bufferY;
		
		printf("tag is %s\n",tagParam[0]);

		res2 = PQexecParams(conn,
			"insert into tags (tag,id,location) values ($1,$2,ST_MakePoint($3,$4))",
			4,
			NULL,
			tagParam,
			NULL,
			NULL,
			1);

		if(PQresultStatus(res2) != PGRES_COMMAND_OK){
			fprintf(stderr, "SELECT failed: %s", PQerrorMessage(conn));

			PQclear(res2);
			do_exit(conn);
		}

		PQclear(res2);



	}while(titer = list_iter_next(titer));




	PQfinish(conn);

		
	json_t *response = json_object();

	json_object_set(response,"route",json_string("gallery-done"));
	
	json_object_set(response,"id",json_string(paramValues[3]));

	send_to_ws(vhd,wsi,json_dumps(response,0));

	
	json_decref(response);
       	//int m = lws_write(wsi, ((unsigned char *)output) +
	//		      LWS_PRE, strlen(json), LWS_WRITE_TEXT);


	return 0;

 }


static int add_hash_location(struct per_vhost_data__minimal *vhd,struct lws *wsi,
		struct per_session_data__minimal *pss){

	
	float x = pss->mpload->x;
	float y = pss->mpload->y;
	
	printf("x and y is %f %f \n",x,y);
	printf("pss x and y is %f %f \n",pss->mpload->x,pss->mpload->y);
	const char *header = pss->mpload->header;
	int nFiles = pss->mpload->nFiles;
	const char *description = pss->mpload->description;	
	


	list_iter_t* iter = list_iter_first(pss->mpload->names);
	

	PGconn *conn = 	PQconnectdb("user=loco dbname=loco");
	PGresult *res,*res1, *res2;
	if(PQstatus(conn) == CONNECTION_BAD){
		fprintf(stderr,"connection to database failed : %s\n",
				PQerrorMessage(conn));

		do_exit(conn);
	}
	char bufferX[64];
	char bufferY[64];
	char bufferP[64];

	int retX = snprintf(bufferX,sizeof(bufferX),"%f",x);
	int retY = snprintf(bufferY,sizeof(bufferY),"%f",y);



	if(retX > sizeof(bufferX) || retY > sizeof(bufferY) ) do_exit(conn);

	const char *paramValues[6];
	
	char cypt[20];
	mcrypt(header,pss->id,cypt);

	printf("before connection\n");


	paramValues[0] =  bufferX;
	paramValues[1] =  bufferY;
	paramValues[2] = (char*)header;
	paramValues[3] =(const char*) cypt;
	paramValues[4] = description;
	paramValues[5] =(const char*)pss->id;


	printf("printfing paramVAlues\n");

	printf("%s\n",paramValues[0]);
	printf("%s\n",paramValues[1]);

	printf("%s\n",paramValues[2]);
	printf("%s\n",paramValues[3]);
	printf("%s\n",paramValues[4]);
	printf("%s\n",paramValues[5]);
//	printf("%d\n",paramValues[6]);
	
	printf("done\n");

	res = PQexecParams(conn,
			"insert into article (location,header,id,description,username) values (ST_MakePoint($1,$2),$3,$4,$5,$6)",
			6,
			NULL,
			paramValues,
			NULL,
			NULL,
			1);


	if(PQresultStatus(res) != PGRES_COMMAND_OK){
			printf("this is error\n");
	
		fprintf(stderr, "SELECT failed: %s", PQerrorMessage(conn));



		PQclear(res);
		do_exit(conn);
	}

	PQclear(res);
	const char *urlParam[3];
	

	mcrypt(header,pss->id,cypt);
	
	do {
		urlParam[0] = list_iter_get_value(iter);
		urlParam[1] = cypt;
		urlParam[2] = pss->id;


		res1 = PQexecParams(conn,
			"insert into urls (url,id,username) values ($1,$2,$3)",
			3,
			NULL,
			urlParam,
			NULL,
			NULL,
			1);

		if(PQresultStatus(res1) != PGRES_COMMAND_OK){
			PQclear(res1);
			do_exit(conn);
		}

		PQclear(res1);



	}while(iter = list_iter_next(iter));


	const char* tagParam[4];
	printf("start of tags\n");
	list_iter_t* titer = list_iter_first(pss->mpload->tags);
	printf("1\n");


	do {
		tagParam[0] = list_iter_get_value(titer);
		tagParam[1] =cypt;

		tagParam[2] = bufferX;
		tagParam[3] = bufferY;
		
		printf("tag is %s\n",tagParam[0]);

		res2 = PQexecParams(conn,
			"insert into tags (tag,id,location) values ($1,$2,ST_MakePoint($3,$4))",
			4,
			NULL,
			tagParam,
			NULL,
			NULL,
			1);

		if(PQresultStatus(res2) != PGRES_COMMAND_OK){
			fprintf(stderr, "SELECT failed: %s", PQerrorMessage(conn));

			PQclear(res2);
			do_exit(conn);
		}

		PQclear(res2);



	}while(titer = list_iter_next(titer));




	PQfinish(conn);

		
	json_t *response = json_object();

	json_object_set(response,"route",json_string("article--done"));
	
	json_object_set(response,"id",json_string(paramValues[3]));

	send_to_ws(vhd,wsi,json_dumps(response,0));

	
	json_decref(response);
       	//int m = lws_write(wsi, ((unsigned char *)output) +
	//		      LWS_PRE, strlen(json), LWS_WRITE_TEXT);


	return 0;

 }

static int get_sur_name(const char *username,json_t* response){



	PGconn *conn = PQconnectdb("user=naro dbname=lashar");
	PGresult *res;

	if(PQstatus(conn) == CONNECTION_BAD){
	
		fprintf(stderr,"connection to database failed : %s\n",PQerrorMessage(conn));
		do_exit(conn);
	}


	
	char bufferX[64];

	int retX = snprintf(bufferX,sizeof(bufferX),"%s",username);

	if(retX > sizeof(bufferX)) do_exit(conn);

	
	const char *paramValue[1] ;
	paramValue[0] = (const char*) bufferX;
	res = PQexecParams(conn,
			"select name , surname from lasharers where username=$1",
			1,
			NULL,
			paramValue,
			NULL,
			NULL,
			1);
	



	if(PQresultStatus(res) != PGRES_TUPLES_OK){
		fprintf(stderr, "SELECT failed: %s", PQerrorMessage(conn));

		PQclear(res);
		do_exit(conn);
	}



	int rows = PQntuples(res);
	
	if(!rows) return 1;

	

	const char* name = PQgetvalue(res,0,0);
	const char* surname = PQgetvalue(res,0,1);


	json_object_set(response,"id",json_string(paramValue[3]));
	json_object_set(response,"surname",json_string(surname));

	return 0;

}

static int get_video(struct per_vhost_data__minimal *vhd,struct lws *wsi,struct per_session_data__minimal *pss,json_t *root){

	const char* username = json_string_value(json_object_get(root,"username"));
	
	

	PGconn *conn = PQconnectdb("user=loco dbname=loco");
	PGresult *res;

	if(PQstatus(conn) == CONNECTION_BAD){
	
		fprintf(stderr,"connection to database failed : %s\n",PQerrorMessage(conn));
		do_exit(conn);
	}


	
	char bufferX[64];

	int retX = snprintf(bufferX,sizeof(bufferX),"%s",username);

	if(retX > sizeof(bufferX)) do_exit(conn);


	const char *paramValue[1] ;
	paramValue[0] = (const char*) bufferX;
	res = PQexecParams(conn,
			"select id, ST_AsEWKT(location),title,description  from video where username=$1",
			1,
			NULL,
			paramValue,
			NULL,
			NULL,
			1);
	

	if(PQresultStatus(res) != PGRES_TUPLES_OK){
		fprintf(stderr, "SELECT failed: %s", PQerrorMessage(conn));

		PQclear(res);
		do_exit(conn);
	}



	int rows = PQntuples(res);
	
	
	json_t *response = json_object();
	json_t *arr = json_array();


	json_object_set(response,"models",arr);
	json_object_set(response,"route",json_string("archive--video"));

	json_object_set(response,"username",json_string(username));
	

	char *id = NULL;
	for(int i = 0 ; i < rows ; i++){
	
		json_t *urls = json_array();
	
		json_t *child = json_object();
		 id =(char*) PQgetvalue(res,i,0);
		geturl(id,urls,conn);

		
		OGRGeometryH geometry ; 
		char* wkt =(char*) PQgetvalue(res,i,1);

	
		OGR_G_CreateFromWkt(&wkt,NULL,&geometry);

		 
		char *title =(char*) PQgetvalue(res,i,2);
		char *description =(char*) PQgetvalue(res,i,3);

		
		json_object_set(child,"id",json_string(id));		
		json_object_set(child,"title",json_string(title));
		json_object_set(child,"description",json_string(description));

		json_object_set(child,"x",json_real(OGR_G_GetX(geometry,0)));
		json_object_set(child,"y",json_real(OGR_G_GetY(geometry,0)));
	
	
		json_object_set(child,"urls",urls);	

		json_array_append(arr,child);
	
		
	}
	


	PQclear(res);
	PQfinish(conn);

	//get_sur_name(username,response);
	send_to_ws(vhd,wsi,json_dumps(response,0));

	
	json_decref(response);
       	//int m = lws_write(wsi, ((unsigned char *)output) +
	//		      LWS_PRE, strlen(json), LWS_WRITE_TEXT);


}


static int get_gallery(struct per_vhost_data__minimal *vhd,struct lws *wsi,struct per_session_data__minimal *pss,json_t *root){

	const char* username = json_string_value(json_object_get(root,"username"));
	
	

	PGconn *conn = PQconnectdb("user=loco dbname=loco");
	PGresult *res;

	if(PQstatus(conn) == CONNECTION_BAD){
	
		fprintf(stderr,"connection to database failed : %s\n",PQerrorMessage(conn));
		do_exit(conn);
	}


	
	char bufferX[64];

	int retX = snprintf(bufferX,sizeof(bufferX),"%s",username);

	if(retX > sizeof(bufferX)) do_exit(conn);


	const char *paramValue[1] ;
	paramValue[0] = (const char*) bufferX;
	res = PQexecParams(conn,
			"select id, ST_AsEWKT(location),title,description  from gallery where username=$1",
			1,
			NULL,
			paramValue,
			NULL,
			NULL,
			1);
	

	if(PQresultStatus(res) != PGRES_TUPLES_OK){
		fprintf(stderr, "SELECT failed: %s", PQerrorMessage(conn));

		PQclear(res);
		do_exit(conn);
	}



	int rows = PQntuples(res);
	
	
	json_t *response = json_object();
	json_t *arr = json_array();


	json_object_set(response,"models",arr);
	json_object_set(response,"route",json_string("archive--gallery"));

	json_object_set(response,"username",json_string(username));
	

	char *id = NULL;
	for(int i = 0 ; i < rows ; i++){
	
		json_t *urls = json_array();
	
		json_t *child = json_object();
		 id =(char*) PQgetvalue(res,i,0);
		geturl(id,urls,conn);

		
		OGRGeometryH geometry ; 
		char* wkt =(char*) PQgetvalue(res,i,1);

	
		OGR_G_CreateFromWkt(&wkt,NULL,&geometry);

		 
		char *title =(char*) PQgetvalue(res,i,2);
		char *description =(char*) PQgetvalue(res,i,3);

		
		json_object_set(child,"id",json_string(id));		
		json_object_set(child,"title",json_string(title));
		json_object_set(child,"description",json_string(description));

		json_object_set(child,"x",json_real(OGR_G_GetX(geometry,0)));
		json_object_set(child,"y",json_real(OGR_G_GetY(geometry,0)));
	
	
		json_object_set(child,"urls",urls);	

		json_array_append(arr,child);
	
		
	}
	


	PQclear(res);
	PQfinish(conn);

	//get_sur_name(username,response);
	send_to_ws(vhd,wsi,json_dumps(response,0));

	
	json_decref(response);
       	//int m = lws_write(wsi, ((unsigned char *)output) +
	//		      LWS_PRE, strlen(json), LWS_WRITE_TEXT);


}


static int get_archive(struct per_vhost_data__minimal *vhd,struct lws *wsi,struct per_session_data__minimal *pss,json_t *root){

	const char* username = json_string_value(json_object_get(root,"username"));
	
	

	PGconn *conn = PQconnectdb("user=loco dbname=loco");
	PGresult *res;

	if(PQstatus(conn) == CONNECTION_BAD){
	
		fprintf(stderr,"connection to database failed : %s\n",PQerrorMessage(conn));
		do_exit(conn);
	}


	
	char bufferX[64];

	int retX = snprintf(bufferX,sizeof(bufferX),"%s",username);

	if(retX > sizeof(bufferX)) do_exit(conn);


	const char *paramValue[1] ;
	paramValue[0] = (const char*) bufferX;
	res = PQexecParams(conn,
			"select id, ST_AsEWKT(location),header,description  from article where username=$1",
			1,
			NULL,
			paramValue,
			NULL,
			NULL,
			1);
	

	if(PQresultStatus(res) != PGRES_TUPLES_OK){
		fprintf(stderr, "SELECT failed: %s", PQerrorMessage(conn));

		PQclear(res);
		do_exit(conn);
	}



	int rows = PQntuples(res);
	
	
	json_t *response = json_object();
	json_t *arr = json_array();


	json_object_set(response,"models",arr);
	json_object_set(response,"route",json_string("archive--article"));

	json_object_set(response,"username",json_string(username));
	

	char *id = NULL;
	for(int i = 0 ; i < rows ; i++){
	
		json_t *urls = json_array();
	
		json_t *child = json_object();
		 id =(char*) PQgetvalue(res,i,0);
		geturl(id,urls,conn);

		
		OGRGeometryH geometry ; 
		char* wkt =(char*) PQgetvalue(res,i,1);

	
		OGR_G_CreateFromWkt(&wkt,NULL,&geometry);

		 
		char *header =(char*) PQgetvalue(res,i,2);
		char *description =(char*) PQgetvalue(res,i,3);

		
		json_object_set(child,"id",json_string(id));		
		json_object_set(child,"header",json_string(header));
		json_object_set(child,"description",json_string(description));

		json_object_set(child,"x",json_real(OGR_G_GetX(geometry,0)));
		json_object_set(child,"y",json_real(OGR_G_GetY(geometry,0)));
	
	
		json_object_set(child,"urls",urls);	

		json_array_append(arr,child);
	
		
	}
	


	PQclear(res);
	PQfinish(conn);

	//get_sur_name(username,response);
	send_to_ws(vhd,wsi,json_dumps(response,0));

	
	json_decref(response);
       	//int m = lws_write(wsi, ((unsigned char *)output) +
	//		      LWS_PRE, strlen(json), LWS_WRITE_TEXT);


}


static int get_profile(struct per_vhost_data__minimal *vhd,struct lws *wsi,struct per_session_data__minimal *pss,json_t *root){

	const char* username = json_string_value(json_object_get(root,"username"));
	
	

	PGconn *conn = PQconnectdb("user=naro dbname=lashar");
	PGresult *res;

	if(PQstatus(conn) == CONNECTION_BAD){
	
		fprintf(stderr,"connection to database failed : %s\n",PQerrorMessage(conn));
		do_exit(conn);
	}


	
	char bufferX[64];

	int retX = snprintf(bufferX,sizeof(bufferX),"%s",username);

	if(retX > sizeof(bufferX)) do_exit(conn);


	const char *paramValue[1] ;
	paramValue[0] = (const char*) bufferX;
	res = PQexecParams(conn,
			"select title , hash from ihash where username=$1",
			1,
			NULL,
			paramValue,
			NULL,
			NULL,
			1);
	

	if(PQresultStatus(res) != PGRES_TUPLES_OK){
		fprintf(stderr, "SELECT failed: %s", PQerrorMessage(conn));

		PQclear(res);
		do_exit(conn);
	}



	int rows = PQntuples(res);
	
	
	json_t *response = json_object();
	json_t *arr = json_array();
	json_t *urls = json_array();


	json_object_set(response,"hashes",arr);
	json_object_set(response,"route",json_string("profile--profile"));

	json_object_set(response,"username",json_string(username));
	

	char *hash = NULL;
	for(int i = 0 ; i < rows ; i++){
		
		json_t *child = json_object();
		 hash =(char*) PQgetvalue(res,i,1);
		geturl(hash,urls,conn);
		json_object_set(child,"hash",json_string(PQgetvalue(res,i,0)));
		json_object_set(child,"mash",json_string(hash));	
		json_array_append(arr,child);
	
		
	}
	
	json_object_set(response,"urls",urls);	


	PQclear(res);
	PQfinish(conn);

	get_sur_name(username,response);
	send_to_ws(vhd,wsi,json_dumps(response,0));

	
	json_decref(response);
       	//int m = lws_write(wsi, ((unsigned char *)output) +
	//		      LWS_PRE, strlen(json), LWS_WRITE_TEXT);


}

static int get_hash_hash(struct per_vhost_data__minimal *vhd,struct lws *wsi,struct per_session_data__minimal *pss,json_t *root){
}
static int show_model(struct per_vhost_data__minimal *vhd,struct lws *wsi,struct per_session_data__minimal *pss,json_t *root){

	const char *h = json_string_value(json_object_get(root,"id"));

	
	PGconn *conn = PQconnectdb("user=loco dbname=loco");
	PGresult *res;

	if(PQstatus(conn) == CONNECTION_BAD){
	
		fprintf(stderr,"connection to database failed : %s\n",PQerrorMessage(conn));
		do_exit(conn);
	}


	
	char bufferX[64];

	int retX = snprintf(bufferX,sizeof(bufferX),"%s",h);

	if(retX > sizeof(bufferX)) do_exit(conn);


	const char *paramValue[1] ;
	paramValue[0] = (const char*) bufferX;
	res = PQexecParams(conn,
			"select ST_AsEWKT(location),title,description,username  from gallery where id=$1",
			1,
			NULL,
			paramValue,
			NULL,
			NULL,
			1);
	

	if(PQresultStatus(res) != PGRES_TUPLES_OK){
		fprintf(stderr, "SELECT failed: %s", PQerrorMessage(conn));

		PQclear(res);
		do_exit(conn);
	}

	int rows = PQntuples(res);
	

	 //GDALAllRegister();

		
		OGRGeometryH geometry ; 
		char* wkt =(char*) PQgetvalue(res,0,0);

	
		OGR_G_CreateFromWkt(&wkt,NULL,&geometry);

		 
		char *title =(char*) PQgetvalue(res,0,1);
		char *description =(char*) PQgetvalue(res,0,2);

		char *username = (char*) PQgetvalue(res,0,3);
		
	

	
		json_t *response = json_object();

	printf("ogr %f \n",OGR_G_GetY(geometry,0));

	if(rows <= 0) return 0; 
	

	
	json_object_set(response,"route",json_string("show--init"));	
	json_object_set(response,"title",json_string(title));
	json_object_set(response,"description",json_string(description));
	json_object_set(response,"id",json_string(h));
	json_object_set(response,"x",json_real(OGR_G_GetX(geometry,0)));
	json_object_set(response,"y",json_real(OGR_G_GetY(geometry,0)));
	json_object_set(response,"username",json_string(username));

	
	get_urls(bufferX,response);


	PQclear(res);
	PQfinish(conn);


	send_to_ws(vhd,wsi,json_dumps(response,0));
	
	
	json_decref(response);

}


static int get_model(struct per_vhost_data__minimal *vhd,struct lws *wsi,struct per_session_data__minimal *pss,json_t *root){

	const char *h = json_string_value(json_object_get(root,"id"));

	
	PGconn *conn = PQconnectdb("user=naro dbname=lashar");
	PGresult *res;

	if(PQstatus(conn) == CONNECTION_BAD){
	
		fprintf(stderr,"connection to database failed : %s\n",PQerrorMessage(conn));
		do_exit(conn);
	}


	
	char bufferX[64];

	int retX = snprintf(bufferX,sizeof(bufferX),"%s",h);

	if(retX > sizeof(bufferX)) do_exit(conn);


	const char *paramValue[1] ;
	paramValue[0] = (const char*) bufferX;
	res = PQexecParams(conn,
			"select ST_AsEWKT(geom),title,price,description,username  from details where id=$1",
			1,
			NULL,
			paramValue,
			NULL,
			NULL,
			1);
	

	if(PQresultStatus(res) != PGRES_TUPLES_OK){
		fprintf(stderr, "SELECT failed: %s", PQerrorMessage(conn));

		PQclear(res);
		do_exit(conn);
	}

	int rows = PQntuples(res);
	

	 //GDALAllRegister();

		
		OGRGeometryH geometry ; 
		char* wkt =(char*) PQgetvalue(res,0,0);

	
		OGR_G_CreateFromWkt(&wkt,NULL,&geometry);

		 
		char *title =(char*) PQgetvalue(res,0,1);
		char *price =(char*) PQgetvalue(res,0,2);

		char *text = (char*) PQgetvalue(res,0,3);
		
	

	
		json_t *response = json_object();

	printf("ogr %f \n",OGR_G_GetY(geometry,0));

	if(rows <= 0) return 0; 
	
	
	json_object_set(response,"route",json_string("show--init"));	
	json_object_set(response,"title",json_string(title));
	json_object_set(response,"price",json_string(price));
	json_object_set(response,"id",json_string(h));
	json_object_set(response,"x",json_real(OGR_G_GetX(geometry,0)));
	json_object_set(response,"y",json_real(OGR_G_GetY(geometry,0)));
	json_object_set(response,"text",json_string(text));

	
	get_urls(bufferX,response);


	PQclear(res);
	PQfinish(conn);


	send_to_ws(vhd,wsi,json_dumps(response,0));
	
	
	json_decref(response);

}


static int insert_urls(struct per_vhost_data__minimal *vhd,struct lws *wsi,struct per_session_data__minimal * pss){


	printf("insert urls\n");


	PGconn *conn = 	PQconnectdb("user=naro dbname=lashar");
	PGresult *res;
	if(PQstatus(conn) == CONNECTION_BAD){
		fprintf(stderr,"connection to database failed : %s\n",
				PQerrorMessage(conn));

		do_exit(conn);
	}
	
	const char *urlParam[2];

	json_t *response = json_object();

	list_iter_t* iter = list_iter_first(pss->mpload->names);

	do {
		urlParam[0] = list_iter_get_value(iter);
		urlParam[1] = pss->mpload->hash;

		res = PQexecParams(conn,
			"insert into url (url,hash) values ($1,$2)",
			2,
			NULL,
			urlParam,
			NULL,
			NULL,
			1);

		if(PQresultStatus(res) != PGRES_COMMAND_OK){
			PQclear(res);
			do_exit(conn);
		}

		PQclear(res);



	}while(iter = list_iter_next(iter));

	PQfinish(conn);
	
	printf("end of this func\n");

	json_object_set(response,"hash",json_string(pss->mpload->hash));

	get_hash_hash(vhd,wsi,pss,response);

	

	printf("after get hash hash\n");

	json_decref(response);
	list_free(pss->mpload->names);
	free(pss->mpload);	

	printf("wow\n");
	return 0;
}


 int get_urls(const char* id,json_t *response){
	
	PGconn *conn = PQconnectdb("user=loco dbname=loco");
	PGresult *res;

	if(PQstatus(conn) == CONNECTION_BAD){
	
		fprintf(stderr,"connection to database failed : %s\n",PQerrorMessage(conn));
		do_exit(conn);
	}


	char bufferX[64];

	int retX = snprintf(bufferX,sizeof(bufferX),"%s",id);

	if(retX > sizeof(bufferX)) do_exit(conn);


	const char *paramValue[1] ;
	paramValue[0] = (const char*) bufferX;
	res = PQexecParams(conn,
			"select url from urls where id=$1",
			1,
			NULL,
			paramValue,
			NULL,
			NULL,
			1);


	if(PQresultStatus(res) != PGRES_TUPLES_OK){
		fprintf(stderr, "SELECT failed: %s", PQerrorMessage(conn));
		
		PQclear(res);
		do_exit(conn);
	}

	int rows = PQntuples(res);
	

	printf("rows is : %d\n",rows); 
	
	
	json_t *arr = json_array();
	json_object_set(response,"urls",arr);
	
	for(int i = 0 ; i < rows ; i++){
		
		json_t *child = json_object();

		json_object_set(child,"url",json_string((char *)PQgetvalue(res,i,0)));
		
		json_array_append(arr,child);
	
		
	}
	
	PQclear(res);
	PQfinish(conn);
	
	return 0;


}



 int gettags(char* hash,json_t *response,PGconn *conn){


	PGresult *res;

	char bufferX[64];

	int retX = snprintf(bufferX,sizeof(bufferX),"%s",hash);

	if(retX > sizeof(bufferX)) do_exit(conn);
	const char *paramValue[1] ;
	paramValue[0] = (const char*) bufferX;
	res = PQexecParams(conn,
			"select tag from tags where id=$1",
			1,
			NULL,
			paramValue,
			NULL,
			NULL,
			1);
	



	if(PQresultStatus(res) != PGRES_TUPLES_OK){
		fprintf(stderr, "SELECT failed: %s", PQerrorMessage(conn));
		
		PQclear(res);
		do_exit(conn);
	}

	int rows = PQntuples(res);
	
	for(int i = 0 ; i < rows ; i++){
		
		json_t *child = json_object();
		
		json_object_set(child,"tag",json_string((char *)PQgetvalue(res,i,0)));
		
		json_array_append(response,child);
	
		
	}

	return 0;



}

 int geturl(char* hash,json_t *response,PGconn *conn){


	PGresult *res;

	char bufferX[64];

	int retX = snprintf(bufferX,sizeof(bufferX),"%s",hash);

	if(retX > sizeof(bufferX)) do_exit(conn);
	const char *paramValue[1] ;
	paramValue[0] = (const char*) bufferX;
	res = PQexecParams(conn,
			"select url from urls where id=$1",
			1,
			NULL,
			paramValue,
			NULL,
			NULL,
			1);
	



	if(PQresultStatus(res) != PGRES_TUPLES_OK){
		fprintf(stderr, "SELECT failed: %s", PQerrorMessage(conn));
		
		PQclear(res);
		do_exit(conn);
	}

	int rows = PQntuples(res);
	
	for(int i = 0 ; i < rows ; i++){
		
		json_t *child = json_object();
		
		json_object_set(child,"url",json_string((char *)PQgetvalue(res,i,0)));
		
		json_array_append(response,child);
	
		
	}

	return 0;



}

static int get_hash_data(struct per_vhost_data__minimal *vhd,struct lws *wsi,struct per_session_data__minimal *pss,json_t *root){

	const char *h = json_string_value(json_object_get(root,"hash"));

	
	PGconn *conn = PQconnectdb("user=naro dbname=lashar");
	PGresult *res;

	if(PQstatus(conn) == CONNECTION_BAD){
	
		fprintf(stderr,"connection to database failed : %s\n",PQerrorMessage(conn));
		do_exit(conn);
	}


	
	char bufferX[64];

	int retX = snprintf(bufferX,sizeof(bufferX),"%s",h);

	if(retX > sizeof(bufferX)) do_exit(conn);


	const char *paramValue[1] ;
	paramValue[0] = (const char*) bufferX;
	res = PQexecParams(conn,
			"select * from ihash where hash=$1",
			1,
			NULL,
			paramValue,
			NULL,
			NULL,
			1);

	if(PQresultStatus(res) != PGRES_TUPLES_OK){
		fprintf(stderr, "SELECT failed: %s", PQerrorMessage(conn));

		PQclear(res);
		do_exit(conn);
	}



	int rows = PQntuples(res);
	if(rows <= 0) return 0; 

	char *h1 = (char *) PQgetvalue(res,0,0);
	char *title =(char*) PQgetvalue(res,0,2);
	char *text = (char*) PQgetvalue(res,0,3);
	char *username = (char*) PQgetvalue(res,0,4);
	

	
	PQclear(res);
	PQfinish(conn);

	json_t *response = json_object();


	json_object_set(response,"route",json_string("home--popup"));	
	json_object_set(response,"title",json_string(title));
	json_object_set(response,"text",json_string(text));
	json_object_set(response,"hash",json_string(h1));
	json_object_set(response,"username",json_string(username));
	
	send_to_ws(vhd,wsi,json_dumps(response,0));
	
	
	json_decref(response);
	//int m = lws_write(wsi, ((unsigned char *)output) +
	//		      LWS_PRE, strlen(json), LWS_WRITE_TEXT);



}

static int delete_hash(struct per_vhost_data__minimal *vhd,struct lws *wsi,struct per_session_data__minimal *pss, json_t *root){

	const char *hash = json_string_value(json_object_get(root,"hash"));

	PGconn *conn = PQconnectdb("user=naro dbname=lashar");
	PGresult *res;

	if(PQstatus(conn) == CONNECTION_BAD){
	
		fprintf(stderr,"connection to database failed : %s\n",PQerrorMessage(conn));
		do_exit(conn);
	}


	
	char bufferX[64];

	int retX = snprintf(bufferX,sizeof(bufferX),"%s",hash);

	if(retX > sizeof(bufferX)) do_exit(conn);


	const char *paramValue[1] ;
	paramValue[0] = hash;
	res = PQexecParams(conn,
			"delete  from ihash where hash=$1",
			1,
			NULL,
			paramValue,
			NULL,
			NULL,
			1);
	
	if(PQresultStatus(res) != PGRES_COMMAND_OK){
		fprintf(stderr, "SELECT failed: %s", PQerrorMessage(conn));

		PQclear(res);
		do_exit(conn);
	}


	json_t *response = json_object();


	json_object_set(response,"route",json_string("delete-hash"));	
	json_object_set(response,"status",json_real(1));
	
	send_to_ws(vhd,wsi,json_dumps(response,0));
	
	
	json_decref(response);
}


static int delete_url(const char* hash,const char *url,PGconn *conn){

	PGresult *res;

	const char *paramValue[2] ;
	paramValue[0] = hash;
	paramValue[1] = url;
	res = PQexecParams(conn,
			"delete  from url where hash=$1 and url=$2",
			2,
			NULL,
			paramValue,
			NULL,
			NULL,
			1);


	if(PQresultStatus(res) != PGRES_COMMAND_OK){ 
	       fprintf(stderr,"insert failed with %s\n",PQerrorMessage(conn));	
		PQclear(res);
		do_exit(conn);
	}

	PQclear(res);
	return 0;

}

static int save_hash(struct per_vhost_data__minimal *vhd,struct lws *wsi,struct per_session_data__minimal *pss, json_t *root){

	const char *username = json_string_value(json_object_get(root,"user"));
	const char  *hash = json_string_value(json_object_get(root,"hash"));

	
	json_t *arr = json_object_get(root,"urls");
    	const char *text = json_string_value(json_object_get(root,"text"));

	long long int ar_size = json_array_size(arr);
	long long int counter ;

	PGconn *conn = PQconnectdb("user=naro dbname=lashar");
	PGresult *res;
	


	if(PQstatus(conn) == CONNECTION_BAD){
	
		fprintf(stderr,"connection to database failed : %s\n",PQerrorMessage(conn));
		do_exit(conn);
	}


	char *url;
	for( counter = 0 ; counter < ar_size ; counter++){
		json_t *jurl;

		jurl = json_array_get(arr,counter);

		url = json_string_value(jurl);
		

		printf("url is %s\n",url);
		delete_url(hash,url,conn);
	
	}


	const char *paramValue[2] ;
	paramValue[0] = text;
	paramValue[1] = hash;
	res = PQexecParams(conn,
			"update ihash  set text=$1 where hash=$2",
			2,
			NULL,
			paramValue,
			NULL,
			NULL,
			1);



	if(PQresultStatus(res) != PGRES_COMMAND_OK){ 
	       fprintf(stderr,"insert failed with %s\n",PQerrorMessage(conn));	
		PQclear(res);
		do_exit(conn);
	}


	update_location(root,conn);

	PQclear(res);
	PQfinish(conn);

	return 0;
}



static int user_login(struct per_vhost_data__minimal *vhd,struct lws *wsi,struct per_session_data__minimal *pss,json_t *root){


	const char *usr = json_string_value(json_object_get(root,"user"));
	const char *pass = json_string_value(json_object_get(root,"pass"));
	
	
	
	PGconn *conn = PQconnectdb("user=naro dbname=lashar");
	PGresult *res;

	if(PQstatus(conn) == CONNECTION_BAD){
	
		fprintf(stderr,"connection to database failed : %s\n",PQerrorMessage(conn));
		do_exit(conn);
	}


	
	char bufferX[64];

	int retX = snprintf(bufferX,sizeof(bufferX),"%s",usr);
	
	
	if(retX > sizeof(bufferX)) do_exit(conn);
	
	const char *paramValue[1] ;
	paramValue[0] = usr;
	res = PQexecParams(conn,
			"select * from lasharers where username=$1",
			1,
			NULL,
			paramValue,
			NULL,
			NULL,
			1);

	if(PQresultStatus(res) != PGRES_TUPLES_OK){
		fprintf(stderr, "SELECT failed: %s", PQerrorMessage(conn));

		PQclear(res);
		do_exit(conn);
	}
	

	int rows = PQntuples(res);

	if(rows <= 0) return 0; 
		

	for( int i = 0 ; i < rows ; i++){
		 char *id = (char *) PQgetvalue(res,i,1);

		 
	}

	
	PQclear(res);
	PQfinish(conn);

        char hex_tmp[2* EVP_MAX_MD_SIZE + 1];

	pasha(pass,hex_tmp);
	

	char *hash[21];
	
	snprintf(hash,20,hex_tmp);
	snprintf(pss->id,sizeof(usr),usr);	

	redis(hash,usr);

	json_t *response = json_object();


	json_object_set(response,"route",json_string("user--loggin"));	
	json_object_set(response,"user",json_string(usr));
	json_object_set(response,"hash",json_string(hash));


	send_to_ws(vhd,wsi,json_dumps(response,0));
	json_decref(response);
	
       	//int m = lws_write(wsi, ((unsigned char *)output) +
	//		      LWS_PRE, strlen(json), LWS_WRITE_TEXT);



}


static int  *createHash(const char *str,char *salt,unsigned char *md){
	

	int len = strlen(str) + strlen(salt) ;
	char* input = malloc(len);
	memcpy(input,salt,strlen(salt));
	memcpy(input + strlen(salt),str,strlen(str));
	
	if(_SHA256(input,strlen(input),md)){
		free(input);		
		return 0;
		
	}

	free(input);
	return -1;
}

static int login_session(struct per_vhost_data__minimal *vhd,struct lws *wsi,struct per_session_data__minimal *pss,json_t *root){
	

	const char *cookie = json_string_value(json_object_get(root,"hash"));
	

	char *hash[21];
	char *user[20];


	snprintf(hash,20,cookie);

	getSession(hash,user);

	

	json_t *response = json_object();


	json_object_set(response,"route",json_string("user--loggin"));	
	json_object_set(response,"user",json_string(user));

	send_to_ws(vhd,wsi,json_dumps(response,0));


	json_decref(response);
	

	return 0;

}
static int user_exists(const char *usr){

	PGconn *conn = PQconnectdb("user=naro dbname=lashar");
	PGresult *res;

	if(PQstatus(conn) == CONNECTION_BAD){
	
		fprintf(stderr,"connection to database failed : %s\n",PQerrorMessage(conn));
		do_exit(conn);
	}

	
	char bufferX[64];

	int retX = snprintf(bufferX,sizeof(bufferX),"%s",usr);

	if(retX > sizeof(bufferX)) do_exit(conn);


	const char *paramValue[1] ;
	paramValue[0] = usr;

	res = PQexecParams(conn,
			"select * from lasharers where name=$1",
			1,
			NULL,
			paramValue,
			NULL,
			NULL,
			1);

	if(PQresultStatus(res) != PGRES_TUPLES_OK){
		fprintf(stderr, "SELECT failed: %s", PQerrorMessage(conn));

		PQclear(res);
		do_exit(conn);
	}


	int rows = PQntuples(res);
	
	PQclear(res);
	PQfinish(conn);

	return rows;

}


static char * get_time(char *bufferT){

	
	
	time_t t = time(NULL);
	struct tm tm = *localtime(&t);



	int retT = snprintf(bufferT,64,"%d-%02d-%02d %02d:%02d:%02d",tm.tm_year + 1900, tm.tm_mon + 1, 
			tm.tm_mday, tm.tm_hour, tm.tm_min, tm.tm_sec);
	
		
	return bufferT;

}

static int create_user(struct per_vhost_data__minimal *vhd,struct lws *wsi,const char *usr,const char* mail){
	

	char  bufferX[64];
	char  bufferY[64];
	char  bufferT[64];
	
	PGconn *conn = 	PQconnectdb("user=naro dbname=register");


	int retX = snprintf(bufferX,sizeof(bufferX),"%s",usr);
	int retY = snprintf(bufferY,sizeof(bufferY),"%s",mail);


	if(retX > sizeof(bufferX) || retY > sizeof(bufferY) ) do_exit(conn);


	const char* paramValue[4];

	 char hex_tmp[2* EVP_MAX_MD_SIZE + 1];

	 paramValue[0] = usr;
	paramValue[1] = mail;
	paramValue[2] = get_time(bufferT);

	pasha(paramValue[2],hex_tmp);

	paramValue[3] = hex_tmp; 
	

	PGresult *res;
	if(PQstatus(conn) == CONNECTION_BAD){
		fprintf(stderr,"connection to database failed : %s\n",
				PQerrorMessage(conn));

		do_exit(conn);
	}


	res = PQexecParams(conn,
			"insert into registers (username,email,regtime,hash) values ($1,$2,$3,$4)",
			4,
			NULL,
			paramValue,
			NULL,
			NULL,
			1);

	if(PQresultStatus(res) != PGRES_COMMAND_OK){ 
	       fprintf(stderr,"insert failed with %s\n",PQerrorMessage(conn));	
		PQclear(res);
		do_exit(conn);
	}

	PQclear(res);
	PQfinish(conn);	


	char *base = "www/files/";
	int size = strlen(base) + strlen(usr) + 1;


	char *buf = (char*)malloc(strlen(base) + strlen(usr) + 1);

	int n1= snprintf(buf,size,"%s%s",base,usr);



	mkdir(buf,0777);


	json_t *response = json_object();


	json_object_set(response,"route",json_string("user--created"));	
	json_object_set(response,"user",json_string(usr));
	json_object_set(response,"email",json_string(mail));

       
	
	send_to_ws(vhd,wsi,json_dumps(response,0));
	json_decref(response);
	free(buf);
//	int m = lws_write(wsi, ((unsigned char *)output) +
//			      LWS_PRE, strlen(json), LWS_WRITE_TEXT);
}


 int send_to_ws(struct per_vhost_data__minimal *vhd,struct lws *wsi, char *json){

	int LEN = strlen(json) + LWS_PRE  ;
	char *output = (char*)malloc(LEN);
	memcpy((char*)output +LWS_PRE , json,strlen(json));

	int m = lws_write(wsi, ((unsigned char *)output) +
			      LWS_PRE, strlen(json), LWS_WRITE_TEXT); 
		if (m < (int)strlen(json)) {
			lwsl_err("ERROR %d writing to ws\n", m);
			return -1;
		}


	free(output);
	return 0;
	//lws_callback_on_writable(wsi);

	
}



static int compile_regex (regex_t * r, const char * regex_text)
{
    int status = regcomp (r, regex_text, REG_EXTENDED|REG_NEWLINE);
    if (status != 0) {
	char error_message[MAX_ERROR_MSG];
	regerror (status, r, error_message, MAX_ERROR_MSG);
        
                 printf("regex error compiling %s %s ",regex_text, error_message);
        return 1;
    }
    return 0;
}

/*
  Match the string in "to_match" against the compiled regular
  expression in "r".
 */

static int match_regex (regex_t * r, const char * to_match)
{
    /* "P" is a pointer into the string which points to the end of the
       previous match. */
    const char * p = to_match;
    /* "N_matches" is the maximum number of matches allowed. */
    const int n_matches = 10;
    /* "M" contains the matches found. */
    regmatch_t m[n_matches];

    while (1) {
        int i = 0;
        int nomatch = regexec (r, p, n_matches, m, 0);
        if (nomatch) {
            
            return nomatch;
        }else return 0;


        for (i = 0; i < n_matches; i++) {
            int start;
            int finish;
            if (m[i].rm_so == -1) {
                break;
            }
            start = m[i].rm_so + (p - to_match);
            finish = m[i].rm_eo + (p - to_match);
        }
        p += m[0].rm_eo;
    }
    return 0;
}

static int check_name(const char* name){

     regex_t r;
    const char * regex_text = "^[[:alnum:]]+(\s[[:alnum:]]+)*$";
    
   
    if(compile_regex (& r, regex_text) || match_regex(&r,name)){
    	regfree(&r);
	return 1;
    }

	regfree(&r);
    return 0;
  }


static int check_surname(const char * surname){
	
	regex_t r;
	const char *regex_text = "^[[:alnum:]]+(\s[[:alnum:]]+)*$";
	
	if(compile_regex(&r,regex_text) || match_regex(&r,surname)){
		regfree(&r);
		return 1;
	}


	regfree(&r);

	return 0;
}

static int check_password(const char* password,const char * repassword){
	
	return strcmp(password,repassword);
		

}
static int check_phone(const char* phone){
	regex_t r;
	const char *regex_text = "^[[:digit:]]+$";

	if(compile_regex(&r,regex_text) || match_regex(&r,phone)){
		regfree(&r);
		return 1;
	}

	regfree(&r);

	return 0;
}
static int check_email(const char*email){
	regex_t r;
	const char *regex_text = "^[[:alnum:]]+([._][[:alnum:]]+)*@[[:alnum:]]+\.[[:alnum:]]+$";

	if(compile_regex(&r,regex_text) || match_regex(&r,email)){
		regfree(&r);
		return 1;
	}

	regfree(&r);
	return 0;
}


static json_t*  sanitize_inputs(const char * name,const char* surname,
		const char *password,const char* rpassword,
		const char* phone,const char* email){

	json_t *arr = json_array();


	
	if(check_name(name)){ 
		json_array_append(arr,json_string("name"));
	}
       	if(check_surname(surname)){
		json_array_append(arr,json_string("surname"));
	
	}
       
	if(check_password(password,rpassword)){
		json_array_append(arr,json_string("password"));

	}
       
	if(check_phone(phone)){
		json_array_append(arr,json_string("phone"));

	
	}
       
	if(check_email(email)){
		json_array_append(arr,json_string("email"));
	}

	return arr;	

}


static int signup(struct per_vhost_data__minimal *vhd,struct lws *wsi,struct per_session_data__minimal *pss,json_t *root){
	
	const char *name = json_string_value(json_object_get(root,"name"));
	const char *surname = json_string_value(json_object_get(root,"surname"));
	const char *password = json_string_value(json_object_get(root,"password"));
	const char *rpassword = json_string_value(json_object_get(root,"re-password"));
	const char *phone = json_string_value(json_object_get(root,"phone"));
	const char *email = json_string_value(json_object_get(root,"email"));
	const char *hash = json_string_value(json_object_get(root,"hash"));
	const char *username = json_string_value(json_object_get(root,"user"));


	json_t* error =   sanitize_inputs(name,surname,password,rpassword,phone,email);

	size_t ers = json_array_size(error);

	json_t *response = json_object();

	if(ers > 0){
	
		
		json_object_set(response,"route",json_string("signup--error"));	
		
	       	json_object_set(response,"error",error);
		
		send_to_ws(vhd,wsi,json_dumps(response,0));
		json_decref(response);
		
		return 1;

	}
	 

	PGconn *conn = 	PQconnectdb("user=naro dbname=lashar");
	PGresult *res;
	if(PQstatus(conn) == CONNECTION_BAD){
		fprintf(stderr,"connection to database failed : %s\n",
				PQerrorMessage(conn));

		do_exit(conn);
	}
	
	
	char bufferX[64];
	char bufferY[64];
	char bufferP[64];
	char bufferN[64];
	char bufferE[64];
	char bufferH[64];
	char bufferU[64];

	int retX = snprintf(bufferX,sizeof(bufferX),"%s",name);
	int retY = snprintf(bufferY,sizeof(bufferY),"%s",surname);
	int retP = snprintf(bufferP,sizeof(bufferP),"%s",password);
	int retN = snprintf(bufferN,sizeof(bufferN),"%s",phone);
	int retE = snprintf(bufferE,sizeof(bufferE),"%s",email);
	int retH = snprintf(bufferH,sizeof(bufferH),"%s",hash);
	int retU = snprintf(bufferU,sizeof(bufferU),"%s",username);


	if(retX > sizeof(bufferX) || retY > sizeof(bufferY) ) do_exit(conn);
	if(retP > sizeof(bufferP) || retN > sizeof(bufferN) || retE > sizeof(bufferE)) do_exit(conn);

	char  bufferT[64];

	time_t t = time(NULL);
	struct tm tm = *localtime(&t);



	int retT = snprintf(bufferT,sizeof(bufferT),"%d-%02d-%02d %02d:%02d:%02d",tm.tm_year + 1900, tm.tm_mon + 1, 
			tm.tm_mday, tm.tm_hour, tm.tm_min, tm.tm_sec);

	const char* paramValue[8];


	paramValue[0] = bufferX;
	paramValue[1] = bufferY;
	paramValue[2] = bufferP;
	paramValue[3] = bufferN;
	paramValue[4] = bufferE;
	paramValue[5] = bufferT;
	paramValue[6] = bufferH;
	paramValue[7] = bufferU;

	res = PQexecParams(conn,
		"insert into lasharers (name,surname,password,phone,email,regtime,hash,username) values ($1,$2,$3,$4,$5,$6,$7,$8)",
			8,
			NULL,
			paramValue,
			NULL,
			NULL,
			1);

	if(PQresultStatus(res) != PGRES_COMMAND_OK){ 
	       fprintf(stderr,"insert failed with %s\n",PQerrorMessage(conn));	
		PQclear(res);
		do_exit(conn);
	}

	PQclear(res);
	PQfinish(conn);	


	char hex_tmp[2* EVP_MAX_MD_SIZE + 1];
	
	pasha(password,hex_tmp);
	

	char *hsh[21];
	snprintf(hsh,20,hex_tmp);	
	
	redis(hsh,username);

	
	char *base = "www/files/";
	int size = strlen(base) + strlen(username) + 1;


	char *buf = (char*)malloc(strlen(base) + strlen(username) + 1);

	int n1= snprintf(buf,size,"%s%s",base,username);



	mkdir(buf,0755);


	json_object_set(response,"route",json_string("signup-created"));	
	json_object_set(response,"hash",json_string(hex_tmp));       
	
	send_to_ws(vhd,wsi,json_dumps(response,0));
	json_decref(response);
	
	free(buf);

	return 0;

}


static int register_user(struct per_vhost_data__minimal *vhd,struct lws *wsi,struct per_session_data__minimal *pss,json_t *root){


	const char *user = json_string_value(json_object_get(root,"user"));
	const char *email = json_string_value(json_object_get(root,"email"));

	//	if(!user_exists(user)) return 0;

	create_user(vhd,wsi,user,email);


}

static int article_read(){

	char *source = NULL;
	
	const char * base = "www/files/";

	int size = strlen(base) + strlen("article.json")+ strlen("naro") + 2;
	
	char *path = (char *)malloc(size);

	int n1 = snprintf(path,size,"%s%s/%s",base,"naro","article.json");

	FILE *fp = fopen(path, "r");
	

	
	if (fp != NULL) {
	    /* Go to the end of the file. */
	    if (fseek(fp, 0L, SEEK_END) == 0) {
		/* Get the size of the file. */
		long bufsize = ftell(fp);
		if (bufsize == -1) { /* Error */ }

		/* Allocate our buffer to that size. */
		source = malloc(sizeof(char) * (bufsize + 1));

		/* Go back to the start of the file. */
		if (fseek(fp, 0L, SEEK_SET) != 0) { /* Error */ }

		/* Read the entire file into memory. */
		size_t newLen = fread(source, sizeof(char), bufsize, fp);
		if ( ferror( fp ) != 0 ) {
		    fputs("Error reading file", stderr);
		} else {
		    source[newLen++] = '\0'; /* Just to be safe. */
		}
	    }
	    fclose(fp);
	}

	json_error_t error;
	json_t *root;	
	root = json_loads(source,0,&error);
	
	if(!root){
		fprintf(stderr,"json error on line %d : %s",error.line,error.text);

	}else {
	
		printf("successfully read jaons string\n");
	}
	
	free(source); /* Don't forget to call free() later! */

}
static int article_upload( struct per_vhost_data__minimal *vhd,struct lws *wsi,
	       struct per_session_data__minimal *pss,char *buff,int len,json_t *root){

	const char * id = json_string_value(json_object_get(root,"id"));


	const char * base = "www/files/";

	int size = strlen(base) + strlen(pss->id)+  strlen(pss->mpload->directory) + strlen("article.json") + 3  ;
	
	char *path = (char *)malloc(size);

	int n1 = snprintf(path,size,"%s%s/%s/article.json",base,pss->id,pss->mpload->directory);

	int fd = lws_open(path,O_CREAT | O_TRUNC | O_RDWR ,0600);
	
	if(fd == -1){
	
		lwsl_notice("failed to open file %s\n",path);
		free(path);
		return 1;
	}

	int n = write(fd,buff,len);	
	

	if(n < len)
		lwsl_notice("problem writing to file %d\n",errno);
	close(fd);
	free(path);
	

	json_t *response = json_object();


	json_object_set(response,"route",json_string("json-uploaded"));	
	json_object_set(response,"id",json_string(pss->mpload->directory));	
	json_object_set(response,"username",json_string(pss->id));

	send_to_ws(vhd,wsi,json_dumps(response,0));
	json_decref(response);
	list_free(pss->mpload->tags);	
	list_free(pss->mpload->names);
	free(pss->mpload);	
	


}
static int video_upload(struct per_vhost_data__minimal *vhd,struct lws *wsi,struct per_session_data__minimal *pss,json_t *root){
	
	json_t *total_length = json_object_get(root,"total");

	json_t *name = json_object_get(root,"filename");
	json_t *arr = json_object_get(root,"data");
    	
	json_t *ln = json_object_get(root,"len");

	long long int ar_size = json_array_size(arr);
	long long int counter ;
	int nmbr ; 
	char *buffer = (char*)malloc(json_array_size(arr));

	for( counter = 0 ; counter < ar_size ; counter++){
		json_t *byte;

		byte = json_array_get(arr,counter);

		nmbr = json_integer_value(byte);
		
		buffer[counter] = (char) nmbr;
	}


	long long int t_length = json_integer_value(total_length);
	long long int len = ar_size;

	char *buf = buffer;
	const char *filename = json_string_value(name);
	pss->total += len;
	int state ;

	if(pss->start){
		create_video(pss,filename);
	}

	
	if(pss->total == t_length)
		state = 2;
	else if(pss->total > t_length)
	       return -1;
	else	
		state = 1;

	switch(state){
		case 1 : 
		case 2 : 
			if(len){
				int n;
			
				n = write(pss->fd,buf,len);
				

				if(n < len)
					lwsl_notice("problem writing to file %d\n",errno);


			}


			if(state == 1)
				break;

			gettimeofday(&pss->t2,NULL);

			double elapsedTime ;

			elapsedTime = (pss->t2.tv_sec -pss->t1.tv_sec);


			   printf("Time in microseconds: %ld microseconds\n",
			    ((pss->t2.tv_sec - pss->t1.tv_sec)*1000000L
			   +pss->t2.tv_usec) - pss->t1.tv_usec
			  ); // Added semicolon

		   
			   

			lwsl_user("%s : file upload done . written %lld \n",__func__,
					pss->filename,pss->total);
		
			close(pss->fd);

			pss->mvideo->uploaded++;
		

			list_add(pss->mvideo->names,filename,strlen(filename)+1);
			pss->start = 1;
			pss->total = 0;
			pss->fd = -1;
			

			printf("upload with name %s\n",filename);		

			//gallery_image(pss,filename);
			printf("handle image");	
			if(pss->mvideo->uploaded == pss->mvideo->nFiles)
			       if(pss->mvideo->edit)
			       		insert_urls(vhd,wsi,pss);
	 			else
					add_video_location(vhd,wsi,pss);		

			break;
		default: 
			break;
	}
	

	free(buffer);
	return 0;
}


static int gallery_upload(struct per_vhost_data__minimal *vhd,struct lws *wsi,struct per_session_data__minimal *pss,json_t *root){
	
	json_t *total_length = json_object_get(root,"total");

	json_t *name = json_object_get(root,"filename");
	json_t *arr = json_object_get(root,"data");
    	
	json_t *ln = json_object_get(root,"len");

	long long int ar_size = json_array_size(arr);
	long long int counter ;
	int nmbr ; 
	char *buffer = (char*)malloc(json_array_size(arr));

	for( counter = 0 ; counter < ar_size ; counter++){
		json_t *byte;

		byte = json_array_get(arr,counter);

		nmbr = json_integer_value(byte);
		
		buffer[counter] = (char) nmbr;
	}


	long long int t_length = json_integer_value(total_length);
	long long int len = ar_size;

	char *buf = buffer;
	const char *filename = json_string_value(name);
	pss->total += len;
	int state ;

	if(pss->start){
		create_image(pss,filename);
	}

	
	if(pss->total == t_length)
		state = 2;
	else if(pss->total > t_length)
	       return -1;
	else	
		state = 1;

	switch(state){
		case 1 : 
		case 2 : 
			if(len){
				int n;
			
				n = write(pss->fd,buf,len);
				

				if(n < len)
					lwsl_notice("problem writing to file %d\n",errno);


			}


			if(state == 1)
				break;

			gettimeofday(&pss->t2,NULL);

			double elapsedTime ;

			elapsedTime = (pss->t2.tv_sec -pss->t1.tv_sec);


			   printf("Time in microseconds: %ld microseconds\n",
			    ((pss->t2.tv_sec - pss->t1.tv_sec)*1000000L
			   +pss->t2.tv_usec) - pss->t1.tv_usec
			  ); // Added semicolon

		   
			   

			lwsl_user("%s : file upload done . written %lld \n",__func__,
					pss->filename,pss->total);
			

			

			close(pss->fd);
	
		
			pss->mgallery->uploaded++;
		

			list_add(pss->mgallery->names,filename,strlen(filename)+1);
			pss->start = 1;
			pss->total = 0;
			pss->fd = -1;
			

			printf("upload with name %s\n",filename);		

			gallery_image(pss,filename);
			printf("handle image");	
			if(pss->mgallery->uploaded == pss->mgallery->nFiles)
			       if(pss->mgallery->edit)
			       		insert_urls(vhd,wsi,pss);
	 			else
					add_gallery_location(vhd,wsi,pss);		

			break;
		default: 
			break;
	}
	

	free(buffer);
	return 0;
}



static int file_upload(struct per_vhost_data__minimal *vhd,struct lws *wsi,struct per_session_data__minimal *pss,json_t *root){
	
	json_t *total_length = json_object_get(root,"total");

	json_t *name = json_object_get(root,"filename");
	json_t *arr = json_object_get(root,"data");
    	
	json_t *ln = json_object_get(root,"len");

	long long int ar_size = json_array_size(arr);
	long long int counter ;
	int nmbr ; 
	char *buffer = (char*)malloc(json_array_size(arr));

	for( counter = 0 ; counter < ar_size ; counter++){
		json_t *byte;

		byte = json_array_get(arr,counter);

		nmbr = json_integer_value(byte);
		
		buffer[counter] = (char) nmbr;
	}


	long long int t_length = json_integer_value(total_length);
	long long int len = ar_size;

	char *buf = buffer;
	const char *filename = json_string_value(name);
	pss->total += len;
	int state ;

	if(pss->start){
		create_file(pss,filename);
	}

	
	if(pss->total == t_length)
		state = 2;
	else if(pss->total > t_length)
	       return -1;
	else	
		state = 1;

	switch(state){
		case 1 : 
		case 2 : 
			if(len){
				int n;
			
				n = write(pss->fd,buf,len);
				

				if(n < len)
					lwsl_notice("problem writing to file %d\n",errno);


			}


			if(state == 1)
				break;

			gettimeofday(&pss->t2,NULL);

			double elapsedTime ;

			elapsedTime = (pss->t2.tv_sec -pss->t1.tv_sec);


			   printf("Time in microseconds: %ld microseconds\n",
			    ((pss->t2.tv_sec - pss->t1.tv_sec)*1000000L
			   +pss->t2.tv_usec) - pss->t1.tv_usec
			  ); // Added semicolon

		   
			   

			lwsl_user("%s : file upload done . written %lld \n",__func__,
					pss->filename,pss->total);
			

			

			close(pss->fd);
	
		
			pss->mpload->uploaded++;
		

			list_add(pss->mpload->names,filename,strlen(filename)+1);
			pss->start = 1;
			pss->total = 0;
			pss->fd = -1;
			

			handle_image(pss,filename);
			
			if(pss->mpload->uploaded == pss->mpload->nFiles)
			       if(pss->mpload->edit)
			       		insert_urls(vhd,wsi,pss);
	 			else
					add_hash_location(vhd,wsi,pss);		

			break;
		default: 
			break;
	}
	

	free(buffer);
	return 0;
}


static int json_upload(struct per_vhost_data__minimal *vhd,struct lws *wsi,struct per_session_data__minimal *pss,json_t *root){


}

const char* router(struct per_vhost_data__minimal *vhd,struct lws *wsi,struct per_session_data__minimal *pss,json_t *root){

	
	json_t *action = json_object_get(root,"action");

	const char *type = json_string_value(action);

	if(!strcmp(type,"upload"))
		file_upload(vhd,wsi,pss,root);
	if(!strcmp(type,"insert"))
		prepare_upload(vhd,wsi,pss,root); 
	if(!strcmp(type,"getbound"))
		get_data_location(vhd ,wsi,pss,root);
	if(!strcmp(type,"register"))
		register_user(vhd,wsi,pss,root);
	if(!strcmp(type,"login"))
		user_login(vhd,wsi,pss,root);

	if(!strcmp(type,"gethash"))
		get_hash_data(vhd,wsi,pss,root);
	if(!strcmp(type,"hash"))
		get_hash_hash(vhd,wsi,pss,root);

	if(!strcmp(type,"profile"))
		get_profile(vhd,wsi,pss,root);
	
	if(!strcmp(type,"save"))
		save_hash(vhd,wsi,pss,root);

	if(!strcmp(type,"delete-hash"))
		delete_hash(vhd,wsi,pss,root);
	if(!strcmp(type,"signup"))
		signup(vhd,wsi,pss,root);
	if(!strcmp(type,"session"))
		login_session(vhd,wsi,pss,root);

	if(!strcmp(type,"edit"))
		prepare_edit(vhd,wsi,pss,root);


	if(!strcmp(type,"model"))
		get_model(vhd,wsi,pss,root);	
	if(!strcmp(type,"archive"))
		get_archive(vhd,wsi,pss,root);
		
	if(!strcmp(type,"article"))
		get_archive(vhd,wsi,pss,root);
	
	if(!strcmp(type,"ugallery"))
		gallery_upload(vhd,wsi,pss,root);

	if(!strcmp(type,"igallery"))
		prepare_gallery(vhd,wsi,pss,root);
	
	if(!strcmp(type,"gallery"))
		get_gallery(vhd,wsi,pss,root);
	if(!strcmp(type,"video"))
		get_video(vhd,wsi,pss,root);


	if(!strcmp(type,"show"))
		show_model(vhd,wsi,pss,root);	
	
	if(!strcmp(type,"uvideo"))
		video_upload(vhd,wsi,pss,root);

	if(!strcmp(type,"ivideo"))
		prepare_video(vhd,wsi,pss,root);
	if(!strcmp(type,"mvideo"))
		get_video_model(vhd,wsi,pss,root);
	



	return type;	

}

static int
callback_minimal(struct lws *wsi, enum lws_callback_reasons reason,
			void *user, void *in, size_t len)
{

	struct per_session_data__minimal *pss =
			(struct per_session_data__minimal *)user;
	struct per_vhost_data__minimal *vhd =
			(struct per_vhost_data__minimal *)
			lws_protocol_vh_priv_get(lws_get_vhost(wsi),
					lws_get_protocol(wsi));
	int m;
	
	switch (reason) {
	case LWS_CALLBACK_PROTOCOL_INIT:
		vhd = lws_protocol_vh_priv_zalloc(lws_get_vhost(wsi),
				lws_get_protocol(wsi),
				sizeof(struct per_vhost_data__minimal));
		vhd->context = lws_get_context(wsi);
		vhd->protocol = lws_get_protocol(wsi);
		vhd->vhost = lws_get_vhost(wsi);
	
		break;

	case LWS_CALLBACK_ESTABLISHED:
		/* add ourselves to the list of live pss held in the vhd */
		lws_ll_fwd_insert(pss, pss_list, vhd->pss_list);
		pss->wsi = wsi;
		pss->total = 0;
		pss->last = vhd->current;
		//ring_buffer_init(&pss->ringbuffer);
		pss->fds =  lws_get_socket_fd(wsi);	
		set_vhd(vhd);

		break;

	case LWS_CALLBACK_CLOSED:
		/* remove our closing pss from the list of live pss */
		lws_ll_fwd_remove(struct per_session_data__minimal, pss_list,
				  pss, vhd->pss_list);
		break;

	case LWS_CALLBACK_SERVER_WRITEABLE:
		if (!vhd->amsg.payload)
			break;

		if (pss->last == vhd->current)
			break;
		

		/* notice we allowed for LWS_PRE in the payload already */
		m = lws_write(wsi, ((unsigned char *)vhd->amsg.payload) +
			      LWS_PRE, vhd->amsg.len, LWS_WRITE_TEXT); 
		if (m < (int)vhd->amsg.len) {
			lwsl_err("ERROR %d writing to ws\n", m);
			return -1;
		}


		if(pss->chain->size){
			m = lws_write(wsi,((unsigned char*)pss->chain->data) + LWS_PRE,pss->chain->size,LWS_WRITE_BINARY);
			

			if(m < pss->chain->size){
				lwsl_err("ERROR %d writing to ws\n",m);
				
					return -1;
				}
					
		}


		pss->last = vhd->current;
		break;

	case LWS_CALLBACK_RECEIVE:
		;
		
		if(pss->total == 0){
			pss->start = 1;
			gettimeofday(&pss->t1,NULL);
		}
		struct incoming_data *rec =  malloc(sizeof(struct incoming_data));
		rec->next = NULL;
		
		/*	lws_start_foreach_llp(struct per_session_data__minimal **,
				      ppss, vhd->pss_list) {
			//printf( "walking thour fds %d\n",(*ppss)->fds);
			
		}  lws_end_foreach_llp(ppss,pss_list); */
	

		//printf("incoming with user id %s\n",pss->fds);
		rec->buf = (char*) malloc(len);
		strncpy(rec->buf,in,len);
			
	
		rec->len = len;
		if(pss->seq == NULL){
			pss->seq = rec;
			pss->current = NULL;

			pss->fragment = 0;
		}


		if(pss->current != NULL)
			pss->current->next = rec;

	
		pss->current = rec;
		
		pss->fragment +=len;
		
		
		char *test =(char*) malloc(len + 1);
		
		




	if(lws_is_final_fragment(wsi)){
		
			
			struct incoming_data *loop ;

						
			char *only = malloc( pss->fragment + 1);
	
			int where = 0;
			loop = pss->seq;
			if(pss->seq == NULL)  return -1;

			do{
	
				strncpy(only + where,loop->buf,loop->len);
				where +=loop->len;

				struct incoming_data *destroy = loop;
				loop = loop->next;
				__minimal_destroy_buffer(destroy);			
				
		   	
			}while(loop);
			
	
			printf("breaked");
			only[pss->fragment] = '\0';
		
			printf(" json size is %d\n",pss->fragment);	
			//article_read();
						
	
	

			json_t *root;
			json_error_t error;
		
			root = json_loads(only,0,&error);
		//	free(only); 
			

			const char* type;


			if(!root)
				fprintf(stderr,"json error on line %d : %s",error.line,error.text);
			else{
		
				type = router(vhd,wsi,pss,root);
					
			}
	
			if(!strcmp(type,"json"))
				article_upload(vhd,wsi,pss,only,pss->fragment,root);	
	

			
			pss->fragment = 0;
			pss->seq = NULL;
			pss->current = NULL;
			
			json_decref(root);
						
		}

//		vhd->current++;

		//	int rem = (int) lws_remaning_packet_payload(wsi);



	//	printf("%s",only);



/*		vhd->current++;

		
		json_t *root;
		json_error_t error;


		root = json_loads(only,0,&error);

		if(!root)
			fprintf(stderr,"error on line %d %s\n",error.line,error.text);



*/
		/*
		 * let everybody know we want to write something on them
		 * as soon as they are ready
		 */
//		lws_start_foreach_llp(struct per_session_data__minimal **,
//				      ppss, vhd->pss_list) {
//			lws_callback_on_writable((*ppss)->wsi);
//		} lws_end_foreach_llp(ppss, pss_list); 
		break;

	default:
		break;
	}
	
	
	

	return 0;
}


const char * get_mimetype(const char *file)
{
	int n = strlen(file);

	if (n < 5)
		return NULL;

	if (!strcmp(&file[n - 4], ".ico"))
		return "image/x-icon";

	if (!strcmp(&file[n - 4], ".png"))
		return "image/png";

	if (!strcmp(&file[n - 5], ".html"))
		return "text/html";
	if(!strcmp(&file[n-3],".js"))
		return "application/javascript";
	if(!strcmp(&file[n-4],".css"))
		return "text/css";
	if(!strcmp(&file[n-5],".jpeg"))
		return "image/jpeg";
	if(!strcmp(&file[n-5],".jpg"))
		return "image/jpg";
	if(!strcmp(&file[n-5],".JPEG"))
		return "image/jpeg";
	if(!strcmp(&file[n-5],".JPG"))
		return "image/jpg";
	if(!strcmp(&file[n-5],".webm"))
		return "video/webm";


	return NULL;
}



int callback_http(struct lws *wsi, enum lws_callback_reasons reason, void *user,
		  void *in, size_t len)
{
	struct per_session_data__http *pss =
			(struct per_session_data__http *)user;
	static unsigned char buffer[4096];
	unsigned long amount, file_len;
	char leaf_path[1024];
	const char *mimetype;
	char *other_headers;
	unsigned char *end;
	struct timeval tv;
	unsigned char *p;
	char buf[256];
	char b64[64];
	int n, m;
	const char *resource_path = "/home/namo/localjournal/ws/www";
	const char *index = "/home/namo/localjournal/ws/www/index.html";

	switch (reason) {
	case LWS_CALLBACK_HTTP:
		if (!lws_hdr_total_length(wsi, WSI_TOKEN_GET_URI)){
		
			break;
		}

			
		mimetype = get_mimetype((const char*)in);

		printf("in is %s\n",(const char*)in);

		strcpy(buf, resource_path);
		if (strcmp(in, "/") && get_mimetype((const char*)in)) {
			if (*((const char *)in) != '/')
				strcat(buf, "/");
			strncat(buf, in, sizeof(buf) - strlen(resource_path));
		} else 
			strcat(buf, "/index.html");
		buf[sizeof(buf) - 1] = '\0';
		


/*

		if (!mimetype && strncmp((const char*)in,"/reload",strlen("/reload") )) {
			


			return lws_callback_http_dummy(wsi,reason,user,(void*)'/',1);
			printf("index is %s\n",index);		
			n = lws_serve_http_file(wsi, index, "text/html", NULL, 0);
	
				

			if (n < 0 || ((n > 0) && lws_http_transaction_completed(wsi)))
			return -1;
		
			break;		
	
		}


*/	

		other_headers = NULL;
		n = 0;
		if (!strncmp((const char *)in, "/reload",strlen("/reload")) &&
					   !lws_hdr_total_length(wsi, WSI_TOKEN_HTTP_COOKIE)) {
		
			char *cookie = in + strlen("/reload/");
			
			n = snprintf(b64,64, "hash=%s;Max-Age=360000",
				cookie );
			
			strcpy(leaf_path,"");
			p = (unsigned char *)leaf_path;
			
				

			mimetype = "text/html";

			if (lws_add_http_header_by_name(wsi,
				(unsigned char *)"set-cookie:",
				(unsigned char *)b64, n, &p,
				(unsigned char *)leaf_path +sizeof(leaf_path)))
				return 1;
			n = (char *)p - leaf_path;
			other_headers = leaf_path;
		}
	
		if(!mimetype) mimetype = "text/html";		


		printf("buff is %s\n",buf);
		printf("mime type is %s\n",mimetype);	
		n = lws_serve_http_file(wsi, buf, mimetype, other_headers, n);

		if (n < 0 || ((n > 0) && lws_http_transaction_completed(wsi)))
			return -1; /* error or can't reuse connection: close the socket */
		break;	

		case LWS_CALLBACK_HTTP_FILE_COMPLETION:
			goto try_to_reuse;

		default:
			break;
	}
	return 0;


try_to_reuse:
	if (lws_http_transaction_completed(wsi))
		return -1;
	return 0;
}


static struct lws_protocols protocols[] = {
	{ "http",callback_http, 0, 0 },
	{"lws-minimal",callback_minimal,sizeof(struct per_session_data__minimal),128,0,NULL,0},
	{ NULL, NULL, 0, 0 } /* terminator */
};

static const struct lws_protocol_vhost_options pvo_mime = {
        NULL,				/* "next" pvo linked-list */
        NULL,				/* "child" pvo linked-list */
        ".webm",				/* file suffix to match */
        "video/webm"		/* mimetype to use */
};

static const struct lws_http_mount mount = {
	/* .mount_next */		NULL,		/* linked-list "next" */
	/* .mountpoint */		"/",		/* mountpoint URL */
	/* .origin */			"./www",  /* serve from dir */
	/* .def */			"index.html",	/* default filename */
	/* .protocol */			NULL,
	/* .cgienv */			NULL,
	/* .extra_mimetypes */		&pvo_mime,
	/* .interpret */		NULL,
	/* .cgi_timeout */		0,
	/* .cache_max_age */		0,
	/* .auth_mask */		0,
	/* .cache_reusable */		0,
	/* .cache_revalidate */		0,
	/* .cache_intermediaries */	0,
	/* .origin_protocol */		LWSMPRO_FILE,	/* files in a dir */
	/* .mountpoint_len */		1,		/* char count */
	/* .basic_auth_login_file */	NULL,
};


static int interrupted;

void sigint_handler(int sig)
{
	interrupted = 1;
}

int main(int argc, const char **argv)
{
	struct lws_context_creation_info info;
	struct lws_context *context;
	const char *p;
	int n = 0, logs = LLL_USER | LLL_ERR | LLL_WARN | LLL_NOTICE
			/* for LLL_ verbosity above NOTICE to be built into lws,
			 * lws must have been configured and built with
			 * -DCMAKE_BUILD_TYPE=DEBUG instead of =RELEASE */
			/* | LLL_INFO */ /* | LLL_PARSER */ /* | LLL_HEADER */
			/* | LLL_EXT */ /* | LLL_CLIENT */ /* | LLL_LATENCY */
			/* | LLL_DEBUG */;

	signal(SIGINT, sigint_handler);

	if ((p = lws_cmdline_option(argc, argv, "-d")))
		logs = atoi(p);

	lws_set_log_level(logs, NULL);
	lwsl_user("LWS minimal ws server | visit http://localhost:7681 (-s = use TLS / https)\n");

	memset(&info, 0, sizeof info); /* otherwise uninitialized garbage */
	info.port = 2000;
	info.mounts = &mount;	
	info.protocols = protocols;
	info.vhost_name = "localhost";
	info.ws_ping_pong_interval = 10;
	info.options =
		LWS_SERVER_OPTION_HTTP_HEADERS_SECURITY_BEST_PRACTICES_ENFORCE;

	if (lws_cmdline_option(argc, argv, "-s")) {
		lwsl_user("Server using TLS\n");
		info.options |= LWS_SERVER_OPTION_DO_SSL_GLOBAL_INIT;
		info.ssl_cert_filepath = "localhost-100y.cert";
		info.ssl_private_key_filepath = "localhost-100y.key";
	}

	if (lws_cmdline_option(argc, argv, "-h"))
		info.options |= LWS_SERVER_OPTION_VHOST_UPG_STRICT_HOST_CHECK;

	context = lws_create_context(&info);
	if (!context) {
		lwsl_err("lws init failed\n");
		return 1;
	}

	while (n >= 0 && !interrupted)
		n = lws_service(context, 0);

	lws_context_destroy(context);

	return 0;
}


