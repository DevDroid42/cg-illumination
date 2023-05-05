#version 300 es
precision mediump float;

// Input
in vec3 model_normal;
in vec3 frag_pos;
in vec2 model_uv;

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
    vec3 N = normalize(model_normal);
    vec3 view = normalize(camera_position - frag_pos);

    vec3 color = ambient * mat_color;

    vec3 light_dir = normalize(light_positions[0] - frag_pos);

    float diffuse = max(dot(light_dir, N), 0.0);
    color += diffuse * light_colors[0] * mat_color;

    vec3 reflection = max(2.0 * dot(N, light_dir) * N, 0.0) - light_dir;
    float specular = pow(max(dot(view, reflection), 0.0), mat_shininess);
    color += specular * light_colors[0] * mat_specular;
    // Color
    FragColor = vec4(color * texture(mat_texture, model_uv).rgb, 1.0);
    // FragColor = vec4(mat_color * texture(mat_texture, model_uv).rgb * ambient, 1.0);
}
