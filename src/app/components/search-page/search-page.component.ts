import { SearchService } from './../../services/search.service';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.scss'],
})
export class SearchPageComponent implements OnInit {
  constructor(
    private httpclient: HttpClient,
    private searchService: SearchService,
    private datePipe: DatePipe
  ) {}

  //List of languages to show is Languages Drop List
  languages: { [key: string]: string } = {
    pt: 'Portugues',
    en: 'English',
    'en-gb': 'English UK',
    es: 'Spanish',
    fr: 'French',
    ar: 'Arabic',
    ja: 'Japanese',
    de: 'German',
    it: 'Italian',
    id: 'Indonesian',
    ko: 'Korean',
    tr: 'Turkish',
    ru: 'Russian',
    nl: 'Dutch',
    fil: 'Filipino',
    msa: 'Malay',
    'zh-tw': 'Traditional Chinese',
    'zh-cn': 'Simplified Chinese',
    hi: 'Hindi',
    no: 'Norwegian',
    sv: 'Swedish',
    fi: 'Finnish',
    da: 'Danish',
    pl: 'Polish',
    hu: 'Hungarian',
    fa: 'Farsi',
    he: 'Hebrew',
    ur: 'Urdu',
    th: 'Thai',
  };

  languageKeys: string[] = Object.keys(this.languages);

  queryContent: string = '';

  langContent: string = 'pt';

  includeRetweets: boolean = false;

  includeReplies: boolean = false;

  fromDate: string = '';

  toDate: string = '';

  twitterAccount = 0;

  //used to show of hide the loading gif
  searchingTweets = false;

  Alert: boolean = false;
  alertMessage: string = '';

  ngOnInit(): void {}

  //Radio Buttons Variables
  public toogleIncludeRetweets() {
    this.includeRetweets = !this.includeRetweets;
  }

  public toogleIncludeReplies() {
    this.includeReplies = !this.includeReplies;
  }

  public switchAccount(account: number) {
    this.twitterAccount = account;
    console.log(this.twitterAccount);
  }

  //Add the specified filter in the query
  private buildQuery() {
    let str = this.queryContent;

    !this.includeReplies ? (str = str + ' -is:reply') : false;

    !this.includeRetweets ? (str = str + ' -is:retweet') : false;

    return str;
  }

  //Return the "today" and "yesterday" dates
  private getDates() {
    const currentDate = new Date();
    const yesterdayDate = new Date(currentDate);
    yesterdayDate.setDate(currentDate.getDate() - 1);

    const formatDate = (date: Date) => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-based
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const formattedNow = formatDate(currentDate);
    const formattedYesterday = formatDate(yesterdayDate);

    return {
      now: formattedNow,
      yesterday: formattedYesterday,
    };
  }

  //Send the data do Backend
  public sendData(endpoint: String) {
    this.Alert = false;
    if (this.queryContent == '') {
      this.showAlert('Informe a Query de busca!');
      return false;
    }

    // get the "toDate" and "fromDate"
    //const dates = this.getDates();

    const dates = this.formatandCompareDates();
    if (dates == null) return false;

    //builds the search query
    let q = this.buildQuery();

    //builds the json data to send to backend
    const dataToSend = {
      twitterAccount: this.twitterAccount,
      query: q,
      lang: this.langContent,
      toDate: dates.toDate,
      fromDate: dates.fromDate,
    };
    this.searchingTweets = true;
    //call the service to send the request
    this.searchService.sendRequest(dataToSend, endpoint).subscribe({
      next: (response: any) => {
        this.downloadExcel(response);
        this.searchingTweets = false;
        return true;
      },
      error: (error) => {
        console.error(error);
        this.searchingTweets = false;
        this.showAlert(
          'Ocorreu um erro! Verifique os parâmetros de Data ou se a API está online'
        );
        return false;
      },
    });
    return false;
  }

  downloadExcel(data: any) {
    const blob = new Blob([data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'data.xlsx';
    link.click();
  }

  teste() {
    const test = this.formatandCompareDates();
    console.log(test);
  }

  private formatDates(dateIn: any): string {
    const transformedDate = this.datePipe.transform(dateIn, 'dd/MM/yyyy');

    const dateOut: string = transformedDate === null ? '' : transformedDate;
    return dateOut;
  }

  private parseDateString(dateString: string): Date | null {
    const dateParts = dateString.split('/');
    if (dateParts.length === 3) {
      const day = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1; // Months are zero-based
      const year = parseInt(dateParts[2], 10);
      return new Date(year, month, day);
    }
    return null; // Invalid date format
  }

  private formatandCompareDates(): any {
    this.Alert = false;

    if (this.fromDate == '' || this.toDate == '') {
      this.showAlert('Por favor, selecione as Datas');
      return null;
    }
    const dtFrom = this.formatDates(this.fromDate);
    const date1 = this.parseDateString(dtFrom);

    const dtTo = this.formatDates(this.toDate);
    const date2 = this.parseDateString(dtTo);

    if (date1 && date2) {
      const timeDifference = date2.getTime() - date1.getTime();
      const daysDifference = timeDifference / (1000 * 60 * 60 * 24);

      if (daysDifference == 0) {
        //this.showAlert('Datas Iguais');
        return { fromDate: dtFrom, toDate: dtTo };
      } else if (daysDifference > 7) {
        this.showAlert(
          'Intervalo entre as datas não pode ser mior que 7 dias!'
        );
        return null;
      } else if (daysDifference < 0) {
        this.showAlert('Data Inicial maior que a Data Final');
        return null;
      }
    }

    return { fromDate: dtFrom, toDate: dtTo };
  }

  showAlert(message: string) {
    this.Alert = true;
    this.alertMessage = message;
  }
}
