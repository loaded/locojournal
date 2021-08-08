#include <stdio.h>
#include <string.h>
#include <jansson.h>




int main(void) {
	

	char *source = NULL;
	
	const char * base = "www/files/";

	int size = strlen(base) + strlen("article.json")+ strlen("naro") + 2;
	
	char *path = (char *)malloc(size);

	int n1 = snprintf(path,size,"%s%s/%s",base,"naro","article.json");

	FILE *fp = fopen(path, "r");
	
	long bufsize ;	
	
	if (fp != NULL) {
	    /* Go to the end of the file. */
	    if (fseek(fp, 0L, SEEK_END) == 0) {
		/* Get the size of the file. */
		 bufsize = ftell(fp);
		if (bufsize == -1) { /* Error */ }

		/* Allocate our buffer to that size. */
		source = malloc(sizeof(char) * (bufsize + 1));
		printf("buffize is %ld\n",bufsize);


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
	root = json_loadb(source,bufsize + 1,0,&error);
	
	if(!root){
		fprintf(stderr,"json error on line %d : %s",error.line,error.text);

	}else {
	
		printf("successfully read jaons string\n");
	}
	
	free(source); /* Don't forget to call free() later! */


/*	char* s = NULL;
	json_t* root = json_object();
	json_t* json_arr = json_array();

          
	json_object_set(root,"destID",json_integer(1));
	json_object_set(root,"command",json_string("enable"));
	json_object_set(root,"respond",json_integer(0));
        json_object_set(root,"data",json_arr);
       
	

	json_t * child = json_object();


	json_object_set(child,"1",json_integer(1));
	json_object_set(child,"2",json_integer(2));
	json_object_set(child,"3",json_integer(3));


	json_array_append(json_arr,child);
       // json_object_set(root,"self",json_deep_copy(root));
	s = json_dumps(root,0);

	printf("sizo %d",strlen(s));
	puts(s);
	json_decref(root);
*/
	return 0;
}
