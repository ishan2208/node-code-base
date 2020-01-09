import * as Handlebars from 'handlebars';

export default class HTMLFormUtil {
  public static replaceMergeCodesWithLowercase(template: string): string {
    const re = /{{([a-zA-Z0-9_ ]*?)}}/g;

    const newTemplate = template.replace(re, value => {
      return value.toLowerCase();
    });

    return newTemplate;
  }

  public static getTemplateVariables(template: string): string[] {
    const variables: string[] = [];
    const re = /{{([a-zA-Z0-9_ ]*?)}}/g;
    const matches = template.match(re);

    if (matches) {
      for (const match of matches) {
        const variable = match.split(/[{}]+/)[1];

        variables.push(`{{${variable}}}`);
      }
    }

    return variables;
  }

  public static compileTemplate(source: string, formData: any): string {
    const template = Handlebars.compile(source);

    return template(formData);
  }

  public static replaceMergeCodes(template: string, mergeCodes: any) {
    if (Object.keys(mergeCodes).length === 0) {
      return template;
    }

    const re = new RegExp(Object.keys(mergeCodes).join('|'), 'gi');

    return template.replace(re, matched => {
      return mergeCodes[matched.toLowerCase()];
    });
  }
}
