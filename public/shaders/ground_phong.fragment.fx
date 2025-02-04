#version 300 es
precision mediump float;

// Input
in vec3 model_normal;
in vec2 model_uv;
in vec3 frag_pos;

// Uniforms
// material
uniform vec3 mat_color;
uniform vec3 mat_specular;
uniform float mat_shininess;
uniform sampler2D mat_texture;
// camera
uniform vec3 camera_position;
// lights
uniform vec3 ambient; // Ia
uniform int num_lights;
uniform vec3 light_positions[8];
uniform vec3 light_colors[8]; // Ip

// Output
out vec4 FragColor;

void main()
{    
    vec3 color = ambient * mat_color;
    vec3 N = normalize(model_normal);
    for(int i = 0; i < num_lights; i++){
        float light_distance = distance(light_positions[i], frag_pos.xyz);
        float light_multiplier = min(2.0/light_distance, 1.0);
        
        vec3 light_dir = normalize(light_positions[i] - frag_pos);
        float diffuse = max(dot(light_dir, N), 0.0);
        color += diffuse * light_colors[i] * mat_color * light_multiplier;

        vec3 V = normalize(camera_position - frag_pos.xyz);
        vec3 R = normalize(max(2.0 * dot(N, light_dir) * N, 0.0) - light_dir);
        color += min(pow(max(dot(R, V), 0.0), mat_shininess) * light_colors[i], 1.0);
    }
    // Color
    FragColor = vec4(color * texture(mat_texture, model_uv).rgb, 1.0);
    
}
